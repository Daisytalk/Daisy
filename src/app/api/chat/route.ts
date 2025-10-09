import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import { streamText, convertToCoreMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import prisma from '@/shared/lib/database'
import { RAGService, Persona } from '@/shared/services/rag'
import { User } from '@/shared/types/auth'
import { env } from '@/shared/config/env'

const ragService = new RAGService();

// Initialize Google AI with API key from environment
// Supports both GEMINI_API_KEY and API_KEY (for AWS)
const apiKey = env.GEMINI_API_KEY || env.API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.error('CRITICAL: No Gemini API key found in environment variables!');
  console.error('Checked: GEMINI_API_KEY, API_KEY, GOOGLE_GENERATIVE_AI_API_KEY');
} else {
  console.log('Gemini API key loaded successfully (length:', apiKey.length, ')');
}

const google = createGoogleGenerativeAI({
  apiKey: apiKey
});

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
  if (!Array.isArray(geminiMessages)) {
    console.error('geminiToAiSdk: Input is not an array', typeof geminiMessages);
    return [];
  }
  return geminiMessages
    .filter((msg): msg is GeminiContent => Boolean(msg && msg.role && Array.isArray(msg.parts)))
    .map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts.map(p => p?.text || '').join('')
    }));
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

    console.log('Raw request body keys:', Object.keys(body))
    console.log('Messages array length:', body.messages?.length)
    if (body.messages?.length > 0) {
      console.log('First message sample:', JSON.stringify(body.messages[0], null, 2))
    }

    // Use AI SDK's built-in converter for UIMessages
    let clientMessages: AISdkMessage[] = []
    if (Array.isArray(body.messages) && body.messages.length > 0) {
      try {
        // Convert UIMessages to CoreMessages, then to our format
        const coreMessages = convertToCoreMessages(body.messages)
        clientMessages = coreMessages.map(msg => ({
          role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: typeof msg.content === 'string' ? msg.content :
            Array.isArray(msg.content) ? msg.content.map((p: any) => p.type === 'text' ? p.text : '').join('') : ''
        })).filter((msg): msg is AISdkMessage => msg.content.length > 0)
      } catch (error) {
        console.error('Error converting messages:', error)
        // Fallback: try manual parsing
        clientMessages = body.messages
          .filter((msg: any) => msg && msg.role)
          .map((msg: any): AISdkMessage | null => {
            if (msg.parts && Array.isArray(msg.parts)) {
              const textContent = msg.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('')
              return {
                role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: textContent
              }
            }
            if (msg.content) {
              return {
                role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: msg.content
              }
            }
            return null
          })
          .filter((msg: AISdkMessage | null): msg is AISdkMessage => msg !== null && msg.content.length > 0)
      }
    } else {
      console.warn('No messages array in request body')
    }

    console.log('Parsed client messages:', {
      count: clientMessages.length,
      messages: clientMessages
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

    // Get session ID from request body
    const sessionId = body.sessionId || body.id

    // Get or create AI session based on sessionId
    let session
    if (sessionId && !sessionId.startsWith('temp_')) {
      // Try to find existing session
      session = await prisma.aiSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        }
      })
    }

    // Create new session if not found or no sessionId provided
    if (!session) {
      session = await prisma.aiSession.create({
        data: {
          userId: user.id,
          messages: [],
          context: { persona: 'intake_specialist' }
        }
      })
      console.log('Created new session:', session.id)
    } else {
      console.log('Using existing session:', session.id)
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

    // Validate we have messages before streaming
    if (allMessages.length === 0) {
      console.error('No messages to process, returning error')
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Stream response using AI SDK
    console.log('Starting streamText with model', 'gemini-2.0-flash-exp', { systemInstruction, messageCount: allMessages.length });
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      messages: allMessages,
      system: systemInstruction,
      temperature: 0.7,
      async onFinish({ text, finishReason, usage }) {
        try {
          console.log('Stream finished:', { finishReason, usage, textLength: text.length });

          // Ensure we have valid client messages to save
          if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
            console.error('No client messages to save')
            return
          }

          const newUserMessage = clientMessages[clientMessages.length - 1]
          if (!newUserMessage || !newUserMessage.content) {
            console.error('Invalid user message')
            return
          }

          const assistantMessage: AISdkMessage = { role: 'assistant', content: text || '' }
          const updatedHistory = aiSdkToGemini([...historyMessages, newUserMessage, assistantMessage])
          const nextPersona = determineNextPersona(currentPersona, updatedHistory.filter(m => m.role === 'user').length, text)

          await prisma.aiSession.update({
            where: { id: session.id },
            data: {
              messages: updatedHistory,
              context: { persona: nextPersona },
              updatedAt: new Date()
            }
          })

          console.log('Conversation saved:', { messageCount: updatedHistory.length, finishReason, usage, nextPersona })
        } catch (error) {
          console.error('Error saving conversation:', error)
        }
      }
    });

    // Return the text stream response with session ID in headers
    // This works with TextStreamChatTransport on the client
    const response = result.toTextStreamResponse()
    response.headers.set('X-Session-Id', session.id)
    return response


  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
