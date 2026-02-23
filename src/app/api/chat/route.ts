import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { sendChatMessage } from '@/shared/lib/ai-api'
import { buildDaisyRequest, handleDaisyResponse, type DaisyLocale } from '@/shared/lib/daisy-integration'

/**
 * Обработка чата в фоне: сбор запроса через buildDaisyRequest, вызов Daisy API, сохранение через handleDaisyResponse.
 */
async function processAsyncChat(
  conversationId: string,
  userMessage: string,
  userId: string,
  locale?: DaisyLocale
) {
  try {
    console.log('🚀 Starting async chat processing:', {
      conversationId,
      userId,
      messagePreview: userMessage.substring(0, 50)
    })

    const payload = await buildDaisyRequest({
      userId,
      conversationId,
      userMessage,
      locale: locale ?? 'ru',
    })

    console.log('📞 Calling Daisy API...', {
      has_onboarding: payload.onboarding_summary != null,
      has_memory: payload.user_context != null && payload.user_context.length > 0,
      history_used: payload.history.length,
      persona: payload.persona,
      locale: payload.locale,
    })

    const aiResponse = await sendChatMessage(
      payload.message,
      payload.user_id,
      conversationId,
      payload.history,
      {
        request_ai_profile: payload.request_ai_profile,
        onboarding_summary: payload.onboarding_summary,
        user_context: payload.user_context,
        persona: payload.persona,
        locale: payload.locale,
        psych_profile: payload.psych_profile,
      }
    )

    console.log('✅ Daisy API response received:', {
      protocol: aiResponse.protocol_used,
      persona: aiResponse.persona_used,
      responseLength: aiResponse.response?.length || 0,
      hasResponse: !!aiResponse.response,
    })

    await handleDaisyResponse(userId, conversationId, aiResponse)
    console.log('✅ Successfully saved assistant response for conversation:', conversationId)
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('❌ Async chat processing failed:', {
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
          conversationId,
          role: 'assistant',
          content: 'Извини, произошла ошибка при обработке сообщения. Попробуй ещё раз.',
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
      return NextResponse.json({ error: apiMessages.noMessageProvided }, { status: 400 })
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
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })
    }

    // Проверка подписки: блокировать чат при истёкшем trial (данные из JWT)
    const now = Date.now()
    const trialEnded =
      decoded.subscriptionStatus === 'trial' &&
      decoded.trialEndsAt != null &&
      new Date(decoded.trialEndsAt).getTime() < now
    if (trialEnded) {
      return NextResponse.json(
        { error: apiMessages.trialExpired, code: 'TRIAL_EXPIRED' },
        { status: 402 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: apiMessages.userNotFound }, { status: 404 })
    }

    const sessionId = body.sessionId || body.id
    const locale = (body.locale === 'ru' || body.locale === 'kk' || body.locale === 'en' ? body.locale : 'ru') as DaisyLocale

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
      const userWithProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { aiProfile: true },
      })
      const ap = userWithProfile?.aiProfile as Record<string, unknown> | null
      const styles = Array.isArray(ap?.communication_style)
        ? (ap.communication_style as string[]).filter((s): s is string => typeof s === 'string')
        : []
      const initialPersona = styles.length > 0 ? styles[0] : 'active_listener'

      conversation = await prisma.cbtConversation.create({
        data: {
          userId: user.id,
          persona: initialPersona,
          sessionId: sessionId || undefined,
        },
        include: {
          messages: true
        }
      })
      console.log('Created new CBT conversation:', conversation.id, 'persona:', initialPersona)
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

    processAsyncChat(conversation.id, userMessage, user.id, locale).catch((error) => {
      console.error('❌ Async chat processing failed:', error)
    })

    // Return immediately with request ID for polling
    return NextResponse.json({
      status: 'processing',
      requestId: userMessageRecord.id,
      conversationId: conversation.id,
      message: apiMessages.messageBeingProcessed
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
      { error: error instanceof Error ? error.message : apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
