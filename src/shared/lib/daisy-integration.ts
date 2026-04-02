/**
 * Интеграция сайта с Daisy API: сбор запроса и сохранение ответа.
 * При КАЖДОМ запросе собираем onboarding_summary, user_context, history, persona, locale.
 * После КАЖДОГО ответа сохраняем ai_profile, memory_update, CbtMessage, логируем debug_context.
 */

import type { Prisma } from '@prisma/client'
import prisma from '@/shared/lib/database'
import type { AIApiResponse } from '@/shared/lib/ai-api'
import { defaultLocale } from '@/i18n'
import { getMemoryBundle, getPrefetchPack, updateConversationState, processMemoryUpdateToEpisodic } from '@/shared/lib/memory'
import { prepareContentForStorage, getDecryptedContent } from '@/shared/lib/cbt-message-content'

const HISTORY_LIMIT = 30
export type DaisyLocale = 'ru' | 'kk' | 'en'

export interface PsychProfilePayload {
  ESI: number
  BSI: number
  SSI: number
  PVI: number
  MRI: number
  riskLevel: string
  cluster?: string
  flags?: Record<string, boolean>
}

export interface DaisyRequestPayload {
  message: string
  user_id: string
  history: Array<{ role: string; content: string }>
  onboarding_summary?: unknown
  user_context?: string
  persona?: string
  locale?: DaisyLocale
  request_ai_profile?: boolean
  psych_profile?: PsychProfilePayload
  protocol_directive?: string
}

interface BuildDaisyRequestInput {
  userId: string
  conversationId: string
  userMessage: string
  locale?: DaisyLocale
}

/**
 * Собирает payload для запроса к Daisy API из БД.
 * Поле запроса → откуда:
 * - onboarding_summary: OnboardingData.responses + User.aiProfile (кто пользователь, цели, проблемы)
 * - user_context: User.conversationMemory (накопленные факты)
 * - history: CbtMessage последние 30
 * - persona: User.aiProfile.communication_style[0] (приоритет) или CbtConversation.persona
 * - locale: настройки пользователя или дефолт из i18n
 */
export async function buildDaisyRequest(input: BuildDaisyRequestInput): Promise<DaisyRequestPayload> {
  const { userId, conversationId, userMessage, locale = defaultLocale } = input

  const [conversation, user, onboardingData, psychSnapshot] = await Promise.all([
    prisma.cbtConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: HISTORY_LIMIT,
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { aiProfile: true, conversationMemory: true },
    }),
    prisma.onboardingData.findUnique({
      where: { userId },
      select: { responses: true },
    }),
    prisma.psychProfileSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const messages = [...(conversation?.messages ?? [])].reverse()
  const decrypted = messages.map((m) => ({ ...m, content: getDecryptedContent(m.content) }))
  const last = decrypted[decrypted.length - 1]
  const isLastCurrentUser = last?.role === 'user' && last?.content === userMessage
  const forHistory = isLastCurrentUser ? decrypted.slice(0, -1) : decrypted
  const history = forHistory.map((msg) => ({ role: msg.role, content: msg.content }))
  const isFirstInConversation = history.length === 0

  // onboarding_summary: ответы онбординга + при необходимости aiProfile для контекста
  let onboardingSummary: unknown = undefined
  if (onboardingData?.responses != null && typeof onboardingData.responses === 'object') {
    onboardingSummary = onboardingData.responses
  }
  // communication_style: массив ['warm_friend', 'practical_helper'] или строка
  let userCommunicationStyles: string[] = []
  if (user?.aiProfile != null && typeof user.aiProfile === 'object' && !Array.isArray(user.aiProfile)) {
    const ap = user.aiProfile as Record<string, unknown>
    if (Array.isArray(ap.communication_style) && ap.communication_style.length > 0) {
      userCommunicationStyles = ap.communication_style.filter((s): s is string => typeof s === 'string')
    } else if (typeof ap.communication_style === 'string' && ap.communication_style) {
      userCommunicationStyles = [ap.communication_style]
    }
    const aiProfilePart = {
      ...(typeof ap.summary === 'string' && { summary: ap.summary }),
      ...(Array.isArray(ap.goals) && ap.goals.length && { goals: ap.goals }),
      ...(Array.isArray(ap.concerns) && ap.concerns.length && { concerns: ap.concerns }),
      ...(userCommunicationStyles.length > 0 && { communication_style: userCommunicationStyles }),
    }
    if (Object.keys(aiProfilePart).length > 0) {
      onboardingSummary =
        typeof onboardingSummary === 'object' && onboardingSummary !== null && !Array.isArray(onboardingSummary)
          ? { ...(onboardingSummary as Record<string, unknown>), ai_profile: aiProfilePart }
          : { ai_profile: aiProfilePart }
    }
  }

  // user_context: conversationMemory (legacy) + memory_items (episodic) + prefetch pack
  const parts: string[] = []
  const memoryArr = Array.isArray(user?.conversationMemory)
    ? (user.conversationMemory as string[])
    : []
  if (memoryArr.length > 0) {
    parts.push(memoryArr.join('. '))
  }
  try {
    const memoryBundle = await getMemoryBundle(userId)
    if (memoryBundle.length > 0) {
      parts.push(`Помню из прошлого: ${memoryBundle.join('; ')}`)
    }
    const prefetch = await getPrefetchPack(userId)
    if (prefetch.lastSessionSummary) {
      parts.push(`Прошлая сессия: ${prefetch.lastSessionSummary.slice(0, 200)}`)
    }
  } catch (e) {
    console.warn('Memory retrieval failed:', e)
  }
  const userContext = parts.length > 0 ? parts.join(' ') : undefined

  // persona: приоритет — выбор пользователя (первый стиль), иначе persona из диалога
  const persona =
    userCommunicationStyles.length > 0
      ? userCommunicationStyles[0]
      : (conversation?.persona ?? 'active_listener')

  const payload: DaisyRequestPayload = {
    message: userMessage,
    user_id: userId,
    history,
    persona,
    locale,
    request_ai_profile: isFirstInConversation,
  }
  if (onboardingSummary != null) {
    payload.onboarding_summary = onboardingSummary
  }
  if (userContext != null && userContext !== '') {
    payload.user_context = userContext
  }
  if (psychSnapshot != null) {
    const { ESI, BSI, SSI, PVI, MRI, riskLevel, cluster, flags } = psychSnapshot
    
    // Adaptive Emotional Regulation Algorithm (Phase Rules)
    let protocol = undefined;
    if (ESI <= 35 || BSI >= 75) {
      protocol = "STABILIZE (DBT STOP / TIPP / grounding)";
    } else if ((ESI >= 36 && ESI <= 60) || (BSI >= 55 && BSI <= 74)) {
      protocol = "REGULATE (DBT + CBT light)";
    } else if (ESI > 60 && BSI < 55) {
      protocol = "SOLVE_REFLECT (CBT / coaching)";
    }

    if (protocol) {
      payload.protocol_directive = protocol;
    }

    payload.psych_profile = {
      ESI,
      BSI,
      SSI,
      PVI,
      MRI,
      riskLevel,
      cluster: cluster ?? undefined,
      flags: (flags as Record<string, boolean>) ?? undefined,
    }
  }

  return payload
}

/**
 * После ответа Daisy: сохраняем ai_profile, memory_update, новый CbtMessage; логируем debug_context.
 * Обновляем conversation_state (lastSessionSummary) и пишем в memory_items по write policy.
 */
export async function handleDaisyResponse(
  userId: string,
  conversationId: string,
  aiResponse: AIApiResponse,
  userMessage?: string
): Promise<void> {
  if (aiResponse.debug_context) {
    console.log('📋 Daisy debug_context:', JSON.stringify(aiResponse.debug_context, null, 2))
  }

  if (!aiResponse.response) {
    throw new Error('No response content from Daisy API')
  }

  await prisma.cbtMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: prepareContentForStorage(aiResponse.response),
      protocol: aiResponse.protocol_used ?? undefined,
      diagnosis: aiResponse.diagnosis ?? [],
      persona: aiResponse.persona_used ?? undefined,
    },
  })

  if (aiResponse.persona_used) {
    await prisma.cbtConversation.update({
      where: { id: conversationId },
      data: { persona: aiResponse.persona_used, updatedAt: new Date() },
    })
  }

  if (aiResponse.ai_profile) {
    await prisma.user.update({
      where: { id: userId },
      data: { aiProfile: aiResponse.ai_profile as Prisma.InputJsonValue },
    })
    console.log('💾 Saved AI profile for user:', userId)
  }

  if (aiResponse.memory_update && aiResponse.memory_update.length > 0) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { conversationMemory: true },
    })
    const existing = Array.isArray(u?.conversationMemory) ? (u!.conversationMemory as string[]) : []
    const merged = [...existing, ...aiResponse.memory_update]
    await prisma.user.update({
      where: { id: userId },
      data: { conversationMemory: merged as Prisma.InputJsonValue },
    })
    console.log('💾 Appended memory_update for user:', userId, 'count:', aiResponse.memory_update.length)

    // Пишем в memory_items по write policy (эпизодическая память)
    await processMemoryUpdateToEpisodic(userId, aiResponse.memory_update)
  }

  // Обновляем conversation_state: lastSessionSummary для prefetch pack
  const lastSessionSummary =
    aiResponse.memory_update?.length
      ? aiResponse.memory_update.join('. ')
      : userMessage && aiResponse.response
        ? `${userMessage.slice(0, 150)}${userMessage.length > 150 ? '…' : ''} → ${aiResponse.response.slice(0, 150)}${aiResponse.response.length > 150 ? '…' : ''}`
        : 'Сессия завершена'
  await updateConversationState(userId, lastSessionSummary.slice(0, 500))
}
