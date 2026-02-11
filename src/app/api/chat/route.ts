import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { sendChatMessage } from '@/shared/lib/ai-api'

/** User fields used for building user_context (aiProfile + conversationMemory) */
type UserContextRow = { aiProfile: unknown; conversationMemory: unknown } | null

/**
 * Process chat request asynchronously
 * This runs in the background without blocking the response
 */
async function processAsyncChat(
  messageId: string,
  conversationId: string,
  userMessage: string,
  userId: string
) {
  try {
    console.log('🚀 Starting async chat processing:', {
      messageId,
      conversationId,
      userId,
      messagePreview: userMessage.substring(0, 50)
    })

    console.log('📞 Calling Azure ML API...')
    
    // Get conversation history from database
    const conversation = await prisma.cbtConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10 // Last 10 messages for context
        }
      }
    })
    
    const allMessages = conversation?.messages ?? []
    const last = allMessages[allMessages.length - 1]
    const isLastCurrentUser = last?.role === 'user' && last?.content === userMessage
    const forHistory = isLastCurrentUser ? allMessages.slice(0, -1) : allMessages
    const history = forHistory.map(msg => ({ role: msg.role, content: msg.content }))

    const isFirstMessageInConversation = history.length === 0
    let onboardingSummary: unknown = undefined
    if (isFirstMessageInConversation) {
      const onboardingData = await prisma.onboardingData.findUnique({
        where: { userId }
      })
      if (onboardingData?.responses && typeof onboardingData.responses === 'object') {
        onboardingSummary = onboardingData.responses
      }
    }

    let userContext: string | undefined
    try {
      const user = (await prisma.user.findUnique({
        where: { id: userId },
        select: { aiProfile: true, conversationMemory: true } as Record<string, boolean>
      })) as UserContextRow
      const userContextParts: string[] = []
      if (user?.aiProfile && typeof user.aiProfile === 'object' && !Array.isArray(user.aiProfile)) {
        const ap = user.aiProfile as Record<string, unknown>
        if (typeof ap.summary === 'string') userContextParts.push(`Summary: ${ap.summary}`)
        if (Array.isArray(ap.goals) && ap.goals.length) userContextParts.push(`Goals: ${(ap.goals as string[]).join(', ')}`)
        if (Array.isArray(ap.concerns) && ap.concerns.length) userContextParts.push(`Concerns: ${(ap.concerns as string[]).join(', ')}`)
        if (typeof ap.communication_style === 'string') userContextParts.push(`Style: ${ap.communication_style}`)
      }
      const memoryArr = Array.isArray(user?.conversationMemory) ? (user.conversationMemory as string[]) : []
      if (memoryArr.length) userContextParts.push(`Memory: ${memoryArr.join('. ')}`)
      userContext = userContextParts.length ? userContextParts.join('\n') : undefined
    } catch (userContextErr) {
      console.warn('⚠️ Failed to load user context (continuing without):', userContextErr instanceof Error ? userContextErr.message : userContextErr)
      userContext = undefined
    }

    console.log('📞 About to call sendChatMessage (Azure ML)...', { hasUserContext: !!userContext, historyLength: history.length })
    const aiResponse = await sendChatMessage(userMessage, userId, conversationId, history, {
      request_ai_profile: isFirstMessageInConversation,
      ...(onboardingSummary != null && { onboarding_summary: onboardingSummary }),
      ...(userContext != null && { user_context: userContext })
    })

    console.log('✅ Azure ML API response received:', {
      protocol: aiResponse.protocol_used,
      persona: aiResponse.persona_used,
      responseLength: aiResponse.response?.length || 0,
      hasResponse: !!aiResponse.response
    })

    if (!aiResponse.response) {
      throw new Error('No response content from Azure ML API')
    }

    console.log('💾 Saving assistant response to database...')
    await prisma.cbtMessage.create({
      data: {
        conversationId: conversationId,
        role: 'assistant',
        content: aiResponse.response,
        protocol: aiResponse.protocol_used,
        diagnosis: aiResponse.diagnosis || [],
        persona: aiResponse.persona_used,
      },
    })

    if (aiResponse.persona_used) {
      await prisma.cbtConversation.update({
        where: { id: conversationId },
        data: {
          persona: aiResponse.persona_used,
          updatedAt: new Date()
        }
      })
    }

    if (aiResponse.ai_profile) {
      await prisma.user.update({
        where: { id: userId },
        data: { aiProfile: aiResponse.ai_profile } as Prisma.UserUpdateInput
      })
      console.log('💾 Saved AI profile for user:', userId)
    }

    if (aiResponse.memory_update && aiResponse.memory_update.length > 0) {
      let existing: string[] = []
      try {
        const u = (await prisma.user.findUnique({
          where: { id: userId },
          select: { conversationMemory: true } as Record<string, boolean>
        })) as { conversationMemory: unknown } | null
        existing = Array.isArray(u?.conversationMemory) ? (u.conversationMemory as string[]) : []
      } catch {
        // ignore
      }
      const merged = [...existing, ...aiResponse.memory_update]
      await prisma.user.update({
        where: { id: userId },
        data: { conversationMemory: merged } as Prisma.UserUpdateInput
      })
      console.log('💾 Appended memory_update for user:', userId, 'count:', aiResponse.memory_update.length)
    }

    console.log('✅ Successfully saved assistant response for message:', messageId)

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('❌ Async chat processing failed:', {
      messageId,
      conversationId,
      userId,
      errorMessage: err.message,
      errorName: err.name,
      stack: err.stack,
      fullError: String(error),
    })
    
    try {
      await prisma.cbtMessage.create({
        data: {
          conversationId: conversationId,
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your message. Please try again.',
          diagnosis: [],
          protocol: 'error',
        },
      })
      console.log('💾 Saved error message to database')
    } catch (dbError) {
      console.error('❌ Failed to save error message:', dbError)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    console.log('Raw request body keys:', Object.keys(body))
    console.log('Messages array length:', body.messages?.length)

    // Extract the latest user message
    let userMessage = ''
    if (Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1]

      // Handle different message formats
      if (typeof lastMessage === 'string') {
        userMessage = lastMessage
      } else if (lastMessage.content) {
        userMessage = typeof lastMessage.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage.content)
      } else if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        userMessage = lastMessage.parts
          .filter((part: { type?: string; text?: string }) => part.type === 'text' || part.text)
          .map((part: { text?: string; content?: string }) => part.text || part.content || '')
          .join('')
      }
    }

    if (!userMessage || userMessage.trim().length === 0) {
      console.warn('No valid user message found in request')
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    console.log('Extracted user message:', userMessage.substring(0, 100))

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
      where: { id: decoded.userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get session ID from request body
    const sessionId = body.sessionId || body.id

    // Get or create CBT conversation based on sessionId
    let conversation
    if (sessionId && !sessionId.startsWith('temp_')) {
      // Try to find existing conversation
      conversation = await prisma.cbtConversation.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    }

    // Create new conversation if not found
    if (!conversation) {
      conversation = await prisma.cbtConversation.create({
        data: {
          userId: user.id,
          persona: 'active_listener', // Initial persona, will be determined by CBT API
          sessionId: sessionId || undefined,
        },
        include: {
          messages: true
        }
      })
      console.log('Created new CBT conversation:', conversation.id)
    } else {
      console.log('Using existing CBT conversation:', conversation.id)
    }

    // Save user message to database
    const userMessageRecord = await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
        diagnosis: [],
      },
    })

    console.log('💾 Saved user message:', userMessageRecord.id)

    // Start async processing in background
    // Don't await - let it process asynchronously
    processAsyncChat(userMessageRecord.id, conversation.id, userMessage, user.id)
      .catch(error => {
        console.error('❌ Async chat processing failed:', error)
      })

    // Return immediately with request ID for polling
    return NextResponse.json({
      status: 'processing',
      requestId: userMessageRecord.id,
      conversationId: conversation.id,
      message: 'Your message is being processed...'
    }, {
      status: 202, // Accepted
      headers: {
        'X-Session-Id': conversation.id,
        'X-Request-Id': userMessageRecord.id,
      }
    })


  } catch (error: unknown) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
