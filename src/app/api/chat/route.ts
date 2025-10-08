import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import prisma from '@/shared/lib/database'
import { RAGService, Persona } from '@/shared/services/rag'
import { User } from '@/shared/types/auth'

const ragService = new RAGService();

// Type definitions for message conversion
interface GeminiContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface AISdkMessage {
  role: 'user' | 'assistant'
  content: string
}

// Convert Gemini format to AI SDK format with defensive checks
function geminiToAiSdk(geminiMessages: GeminiContent[]): AISdkMessage[] {
  // Ensure input is an array
  if (!Array.isArray(geminiMessages)) {
    console.error('geminiToAiSdk: Input is not an array', typeof geminiMessages)
    return []
  }

  return geminiMessages
    .filter((msg): msg is GeminiContent => Boolean(msg && msg.role && Array.isArray(msg.parts))) // Filter out invalid messages
    .map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts.map(p => p?.text || '').join('')
    }))
}

// Convert AI SDK format to Gemini format with defensive checks
function aiSdkToGemini(aiMessages: AISdkMessage[]): GeminiContent[] {
  // Ensure input is an array
  if (!Array.isArray(aiMessages)) {
    console.error('aiSdkToGemini: Input is not an array', typeof aiMessages)
    return []
  }

  return aiMessages
    .filter((msg): msg is AISdkMessage => Boolean(msg && msg.role && msg.content)) // Filter out invalid messages
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    }))
}

// Determine next persona based on conversation
function determineNextPersona(currentPersona: Persona, messageCount: number, fullResponse: string): Persona {
  // After the first few exchanges, move from intake to a more directive role
  if (currentPersona === 'intake_specialist' && messageCount > 2) {
    return 'questioner_and_clarifier';
  }

  // If the user starts talking about specific actions, switch to the behavioral coach
  if (fullResponse.toLowerCase().includes('i should try') || fullResponse.toLowerCase().includes('my goal is')) {
    return 'goal_setting_coach';
  }

  return currentPersona;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Defensive check: Ensure messages is an array
    let clientMessages: AISdkMessage[] = []
    if (Array.isArray(body.messages)) {
      clientMessages = body.messages.filter((msg: any): msg is AISdkMessage =>
        msg && msg.role && msg.content
      )
    } else {
      console.warn('Invalid messages format received:', typeof body.messages)
    }

    console.log('Chat API called with:', {
      messageCount: clientMessages.length,
      lastMessage: clientMessages[clientMessages.length - 1]
    })

    // Authentication - try cookie first, then Bearer token
    let token = request.cookies.get('auth_token')?.value

    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create AI session
    let session = await prisma.aiSession.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (!session) {
      session = await prisma.aiSession.create({
        data: {
          userId: user.id,
          messages: [],
          context: { persona: 'intake_specialist' }
        }
      })
    }

    // Get current persona from session context
    // @ts-ignore
    const currentPersona = (session.context?.persona || 'intake_specialist') as Persona

    // Get system instruction from RAG service
    const { systemInstruction } = await ragService.getContext(user as User, currentPersona)

    // Convert stored Gemini history to AI SDK format with defensive checks
    let historyMessages: AISdkMessage[] = []

    try {
      // Ensure session.messages is an array before converting
      const storedMessages = session.messages

      if (Array.isArray(storedMessages) && storedMessages.length > 0) {
        historyMessages = geminiToAiSdk(storedMessages as unknown as GeminiContent[])
      } else {
        console.log('No valid message history found, starting fresh')
      }
    } catch (error) {
      console.error('Error converting message history:', error)
      // Continue with empty history if conversion fails
      historyMessages = []
    }

    // Combine history with new messages
    const allMessages = [...historyMessages, ...clientMessages]

    console.log('Streaming with:', {
      historyCount: historyMessages.length,
      newMessagesCount: clientMessages.length,
      totalMessages: allMessages.length,
      persona: currentPersona
    })

    // Stream response using AI SDK
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      messages: allMessages,
      system: systemInstruction,
      temperature: 0.7,
      async onFinish({ text, finishReason, usage }) {
        try {
          // Defensive check: Ensure we have client messages
          if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
            console.error('No client messages to save')
            return
          }

          // Save the conversation to database
          const newUserMessage = clientMessages[clientMessages.length - 1]

          if (!newUserMessage || !newUserMessage.content) {
            console.error('Invalid user message')
            return
          }

          const assistantMessage: AISdkMessage = {
            role: 'assistant',
            content: text || ''
          }

          // Convert to Gemini format for storage
          const updatedHistory = aiSdkToGemini([
            ...historyMessages,
            newUserMessage,
            assistantMessage
          ])

          // Determine next persona
          const nextPersona = determineNextPersona(
            currentPersona,
            updatedHistory.filter(m => m.role === 'user').length,
            text
          )

          // Update session in database
          await prisma.aiSession.update({
            where: { id: session.id },
            data: {
              messages: updatedHistory,
              context: { persona: nextPersona },
              updatedAt: new Date()
            }
          })

          console.log('Conversation saved:', {
            messageCount: updatedHistory.length,
            finishReason,
            usage,
            nextPersona
          })
        } catch (error) {
          console.error('Error saving conversation:', error)
        }
      }
    })

    // Return the streaming response
    return result.toTextStreamResponse()

  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
