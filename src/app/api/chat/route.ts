import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { sendChatMessage } from '@/shared/lib/ai-api'
import { buildDaisyRequest, handleDaisyResponse, type DaisyLocale } from '@/shared/lib/daisy-integration'
import { redactPII } from '@/shared/lib/pii/redactor'
import { prepareContentForStorage } from '@/shared/lib/cbt-message-content'
import { rateLimitAI } from '@/shared/lib/rate-limit'
import { scanForInjection } from '@/shared/lib/input-guard'
import { logger } from '@/shared/lib/safe-logger'
import { detectCrisis, CRISIS_RESPONSE } from '@/shared/lib/crisis-detection'
import { defaultLocale } from '@/i18n'
import { pickLocaleFromCookieOrUser } from '@/shared/lib/locale-detection'

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
    logger.info('async_chat_start', {
      conversationId,
      userId,
      messageLength: userMessage.length,
    })

    const payload = await buildDaisyRequest({
      userId,
      conversationId,
      userMessage,
      locale: locale ?? defaultLocale,
    })

    logger.info('daisy_api_call', {
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
        protocol_directive: payload.protocol_directive,
      }
    )

    logger.info('daisy_api_response', {
      protocol: aiResponse.protocol_used,
      persona: aiResponse.persona_used,
      responseLength: aiResponse.response?.length || 0,
      hasResponse: !!aiResponse.response,
    })

    await handleDaisyResponse(userId, conversationId, aiResponse, userMessage)
    logger.info('async_chat_saved', { conversationId })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('async_chat_failed', {
      conversationId,
      userId,
      errorMessage: err.message,
      errorName: err.name,
    })
    try {
      await prisma.cbtMessage.create({
        data: {
          conversationId,
          role: 'assistant',
          content: prepareContentForStorage('Извини, произошла ошибка при обработке сообщения. Попробуй ещё раз.'),
          diagnosis: [],
          protocol: 'error',
        },
      })
      logger.info('async_chat_error_message_saved', { conversationId })
    } catch (dbError) {
      logger.error('async_chat_error_save_failed', {
        conversationId,
        message: dbError instanceof Error ? dbError.message : String(dbError),
      })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    logger.info('chat_request_received', {
      bodyKeys: Object.keys(body),
      messagesCount: body.messages?.length,
    })

    let userMessage = ''
    if (Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1]

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
      return NextResponse.json({ error: apiMessages.noMessageProvided }, { status: 400 })
    }

    const { redacted, hadPII, detectedTypes } = redactPII(userMessage.trim())
    const messageToStore = redacted

    if (hadPII) {
      logger.warn('pii_detected_l1', { types: detectedTypes })
    }

    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })
    }

    const HARD_MAX = 10_000
    if (userMessage.trim().length > HARD_MAX) {
      return NextResponse.json(
        { error: 'Сообщение слишком длинное. Попробуйте разбить на части.' },
        { status: 400 }
      )
    }

    if (scanForInjection(userMessage)) {
      logger.warn('injection_attempt', { userId: decoded.userId, length: userMessage.length })
      return NextResponse.json(
        { error: 'Сообщение содержит недопустимый контент.' },
        { status: 400 }
      )
    }

    const { allowed, retryAfterMs } = await rateLimitAI(decoded.userId, userMessage)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Пожалуйста, подождите немного.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        }
      )
    }

    if (decoded.subscriptionStatus === 'expired' || decoded.subscriptionStatus === 'cancelled') {
      return NextResponse.json(
        { error: apiMessages.trialExpired, code: 'SUBSCRIPTION_INACTIVE' },
        { status: 402 }
      )
    }
    const trialEnded =
      decoded.subscriptionStatus === 'trial' &&
      decoded.trialEndsAt != null &&
      new Date(decoded.trialEndsAt).getTime() < Date.now()
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
    const bodyLocale =
      body.locale === 'ru' || body.locale === 'kk' || body.locale === 'en' ? body.locale : null
    const locale = (bodyLocale ?? pickLocaleFromCookieOrUser(request, null)) as DaisyLocale

    let conversation
    if (sessionId && !sessionId.startsWith('temp_')) {
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
      logger.info('cbt_conversation_created', { conversationId: conversation.id, persona: initialPersona })
    } else {
      logger.info('cbt_conversation_reused', { conversationId: conversation.id })
    }

    if (detectCrisis(messageToStore)) {
      logger.warn('crisis_detected', { userId: user.id })
      const crisisMsg = await prisma.cbtMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: prepareContentForStorage(CRISIS_RESPONSE),
          diagnosis: [],
          isAnonymized: true,
        },
      })
      return NextResponse.json({
        response: CRISIS_RESPONSE,
        isCrisis: true,
        phase: 'STABILIZE',
        requestId: crisisMsg.id,
        conversationId: conversation.id,
      })
    }

    const userMessageRecord = await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: prepareContentForStorage(messageToStore),
        diagnosis: [],
        isAnonymized: hadPII,
        piiDetected: hadPII,
      },
    })

    if (hadPII) {
      await prisma.piiAuditLog.create({
        data: {
          userId: user.id,
          messageId: userMessageRecord.id,
          entityTypes: detectedTypes,
          layer: 'L1_REGEX',
        },
      })
    }

    processAsyncChat(conversation.id, messageToStore, user.id, locale).catch((error) => {
      logger.error('async_chat_dispatch_failed', {
        message: error instanceof Error ? error.message : String(error),
      })
    })

    return NextResponse.json({
      status: 'processing',
      requestId: userMessageRecord.id,
      conversationId: conversation.id,
      message: apiMessages.messageBeingProcessed
    }, {
      status: 202,
      headers: {
        'X-Session-Id': conversation.id,
        'X-Request-Id': userMessageRecord.id,
      }
    })


  } catch (error: unknown) {
    logger.error('chat_api_error', {
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
