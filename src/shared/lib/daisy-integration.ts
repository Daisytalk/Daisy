/**
 * Интеграция сайта с Daisy API: сбор запроса и сохранение ответа.
 * При КАЖДОМ запросе собираем onboarding_summary, user_context, history, persona, locale.
 * После КАЖДОГО ответа сохраняем ai_profile, memory_update, CbtMessage, логируем debug_context.
 */

import type { Prisma } from '@prisma/client'
import prisma from '@/shared/lib/database'
import type { AIApiResponse } from '@/shared/lib/ai-api'
import type { DaisyState } from '@/shared/types/daisy'
import { defaultLocale } from '@/i18n'
import { getMemoryBundle, getPrefetchPack, updateConversationState, processMemoryUpdateToEpisodic } from '@/shared/lib/memory'
import { prepareContentForStorage, getDecryptedContent } from '@/shared/lib/cbt-message-content'
import { cleanModelText, sanitizeHistoryForModel } from '@/shared/lib/clean-model-text'
import {
  getDecryptedSensitiveJson,
  prepareSensitiveJsonForStorage,
} from '@/shared/lib/sensitive-field-crypto'
import { logger } from '@/shared/lib/safe-logger'

const HISTORY_LIMIT = 20
export type DaisyLocale = 'ru' | 'kk' | 'en'

export type HistoryTurn = { role: string; content: string }

/**
 * Build AML history from stored messages, excluding the current user turn if already persisted.
 */
export function buildHistoryFromStoredMessages(
  messages: Array<{ role: string; content: string }>,
  currentUserMessage?: string
): HistoryTurn[] {
  const decrypted = messages.map((m) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : '',
  }))
  const last = decrypted[decrypted.length - 1]
  const isLastCurrentUser =
    currentUserMessage != null &&
    last?.role === 'user' &&
    last?.content === currentUserMessage
  const forHistory = isLastCurrentUser ? decrypted.slice(0, -1) : decrypted
  return sanitizeHistoryForModel(
    forHistory.map((msg) => ({ role: msg.role, content: msg.content }))
  )
}

/**
 * Load last N turns for a conversation (for CBT route and other callers).
 */
export async function loadConversationHistory(
  conversationId: string,
  userId: string,
  currentUserMessage?: string
): Promise<HistoryTurn[]> {
  const conversation = await prisma.cbtConversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: HISTORY_LIMIT,
      },
    },
  })
  if (!conversation) {
    return []
  }
  const ordered = [...conversation.messages].reverse().map((m) => ({
    role: m.role,
    content: getDecryptedContent(m.content),
  }))
  return buildHistoryFromStoredMessages(ordered, currentUserMessage)
}

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
 * Поле запроса и источник:
 * - onboarding_summary: OnboardingData.responses + User.aiProfile (кто пользователь, цели, проблемы)
 * - user_context: User.conversationMemory (накопленные факты)
 * - history: CbtMessage последние 20 (assistant turns cleaned before AML)
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

  if (!conversation) {
    throw new Error('Conversation not found')
  }
  if (conversation.userId !== userId) {
    throw new Error('Conversation does not belong to user')
  }

  const messages = [...conversation.messages].reverse()
  const decrypted = messages.map((m) => ({ ...m, content: getDecryptedContent(m.content) }))
  const history = buildHistoryFromStoredMessages(
    decrypted.map((msg) => ({ role: msg.role, content: msg.content })),
    userMessage
  )
  backfillCleanAssistantMessages(decrypted).catch((e) =>
    logger.warn('history_backfill_failed', {
      conversationId,
      message: e instanceof Error ? e.message : String(e),
    })
  )
  const isFirstInConversation = history.length === 0

  // onboarding_summary: ответы онбординга + при необходимости aiProfile для контекста
  let onboardingSummary: unknown = undefined
  const decryptedResponses = getDecryptedSensitiveJson(onboardingData?.responses)
  if (decryptedResponses != null && typeof decryptedResponses === 'object') {
    onboardingSummary = decryptedResponses
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
  const decryptedMemory = getDecryptedSensitiveJson<string[]>(user?.conversationMemory)
  const memoryArr = Array.isArray(decryptedMemory) ? decryptedMemory : []
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
    logger.warn('memory_retrieval_failed', {
      userId,
      message: e instanceof Error ? e.message : String(e),
    })
  }
  const userContext = parts.length > 0 ? parts.join(' ') : undefined

  // persona: приоритет — выбор пользователя (первый стиль), иначе persona из диалога
  const persona =
    userCommunicationStyles.length > 0
      ? userCommunicationStyles[0]
      : (conversation.persona ?? 'active_listener')

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
    const dbg = aiResponse.debug_context as unknown as Record<string, unknown>
    logger.info('daisy_debug_context', {
      daisy_state: dbg.daisy_state,
      brief_retry_count: dbg.brief_retry_count,
      degenerate_retry_count: dbg.degenerate_retry_count,
      protocol: aiResponse.protocol_used,
      persona: aiResponse.persona_used,
    })
  }

  if (!aiResponse.response) {
    throw new Error('No response content from Daisy API')
  }

  const sanitizedResponse = cleanModelText(aiResponse.response)

  await prisma.cbtMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: prepareContentForStorage(sanitizedResponse),
      protocol: aiResponse.protocol_used ?? undefined,
      diagnosis: aiResponse.diagnosis ?? [],
      persona: aiResponse.persona_used ?? undefined,
      daisyState: (aiResponse.debug_context?.daisy_state as DaisyState | null) ?? null,
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
    logger.info('ai_profile_saved', { userId })
  }

  if (aiResponse.memory_update && aiResponse.memory_update.length > 0) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { conversationMemory: true },
    })
    const existing =
      getDecryptedSensitiveJson<string[]>(u?.conversationMemory) ?? []
    const merged = [...existing, ...aiResponse.memory_update]
    await prisma.user.update({
      where: { id: userId },
      data: {
        conversationMemory: prepareSensitiveJsonForStorage(merged) as Prisma.InputJsonValue,
      },
    })
    logger.info('memory_update_appended', { userId, count: aiResponse.memory_update.length })

    // Пишем в memory_items по write policy (эпизодическая память)
    await processMemoryUpdateToEpisodic(userId, aiResponse.memory_update)
  }

  // Обновляем conversation_state: lastSessionSummary для prefetch pack
  const lastSessionSummary =
    aiResponse.memory_update?.length
      ? aiResponse.memory_update.join('. ')
      : userMessage && aiResponse.response
        ? `${userMessage.slice(0, 150)}${userMessage.length > 150 ? '…' : ''} · ${sanitizedResponse.slice(0, 150)}${sanitizedResponse.length > 150 ? '…' : ''}`
        : 'Сессия завершена'
  await updateConversationState(userId, lastSessionSummary.slice(0, 500))
}

/** Rewrite stored assistant rows when they still contain OCR/accent junk from older inference. */
async function backfillCleanAssistantMessages(
  messages: Array<{ id: string; role: string; content: string }>
): Promise<void> {
  const updates = messages
    .filter((m) => m.role === 'assistant')
    .map((m) => ({ id: m.id, cleaned: cleanModelText(m.content), raw: m.content }))
    .filter(({ cleaned, raw }) => cleaned !== raw)

  if (!updates.length) return

  await Promise.all(
    updates.map(({ id, cleaned }) =>
      prisma.cbtMessage.update({
        where: { id },
        data: { content: prepareContentForStorage(cleaned) },
      })
    )
  )
  logger.info('history_backfill_cleaned', { count: updates.length })
}
