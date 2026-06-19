/**
 * Memory Architecture: retrieval pipeline, write policy, user preferences.
 * 3 layers: Identity (preferences), Clinical-lite (psych_profile), Episodic (memory_items).
 */

import prisma from '@/shared/lib/database'
import { getDecryptedContent } from '@/shared/lib/cbt-message-content'

const MEMORY_RECENCY_DAYS = 180
const MEMORY_MIN_CONFIDENCE = 0.55
const MEMORY_TOP_K = 12
const MEMORY_RERANK_LIMIT = 6
const MEMORY_SUMMARY_MAX_CHARS = 150

export type MemoryType = 'event' | 'belief' | 'relationship' | 'health' | 'habit'
export type MemoryTopic = 'work' | 'relationship' | 'anxiety' | 'sleep' | 'self-worth' | 'planning' | 'loneliness' | 'burnout' | 'other'

export interface MemoryWriteInput {
  userId: string
  type: MemoryType
  topic: MemoryTopic
  summary: string
  valence?: number
  intensity?: number
  evidence?: string
  confidence?: number
  isPinned?: boolean
  consentScope?: 'core' | 'personal' | 'sensitive'
  ttlDays?: number
}

/**
 * Write policy: пишем только если соответствует критериям.
 * - пользователь явно сказал "запомни"
 * - повторяется ≥2 раз за 7–14 дней (паттерн)
 * - высокая эмоциональная значимость (intensity≥2) + важная тема
 * - полезно для персонализации (предпочтения, границы, триггеры)
 */
export async function writeMemoryIfEligible(input: MemoryWriteInput): Promise<boolean> {
  const { userId, type, topic, summary, intensity = 0, confidence = 0.8, ttlDays = 90 } = input

  // Базовые проверки
  if (!summary || summary.trim().length < 10) return false
  if (summary.length > 500) return false

  const importantTopics: MemoryTopic[] = ['relationship', 'anxiety', 'sleep', 'loneliness', 'burnout', 'work']
  const shouldWrite =
    intensity >= 2 && importantTopics.includes(topic) ||
    input.isPinned === true ||
    confidence >= 0.85

  if (!shouldWrite) return false

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000)

  await prisma.memoryItem.create({
    data: {
      userId,
      type,
      topic,
      summary: summary.trim().slice(0, 500),
      valence: input.valence ?? null,
      intensity: input.intensity ?? null,
      evidence: input.evidence ?? null,
      confidence,
      ttlDays,
      expiresAt,
      isPinned: input.isPinned ?? false,
      consentScope: input.consentScope ?? 'core',
    },
  })
  return true
}

/**
 * Retrieval: prefetch pack + candidate fetch + rerank.
 * Возвращает короткие строки для контекста (1–2 строки на item).
 */
export async function getMemoryBundle(
  userId: string,
  intentTopic?: MemoryTopic,
  limit = MEMORY_RERANK_LIMIT
): Promise<string[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - MEMORY_RECENCY_DAYS)

  const now = new Date()

  const items = await prisma.memoryItem.findMany({
    where: {
      userId,
      consentScope: { in: ['core', 'personal'] },
      createdAt: { gte: cutoff },
      ...(intentTopic && { topic: intentTopic }),
    },
    orderBy: { createdAt: 'desc' },
    take: MEMORY_TOP_K,
  })

  const notExpired = items.filter((m) => {
    if (m.isPinned) return true
    if (m.expiresAt) return m.expiresAt > now
    if (m.ttlDays != null) {
      return m.createdAt.getTime() + m.ttlDays * 86400000 > now.getTime()
    }
    return true
  })

  const filtered = notExpired.filter((m) => (m.confidence ?? 0.5) >= MEMORY_MIN_CONFIDENCE)
  const reranked = filtered
    .sort((a, b) => {
      const scoreA = (a.isPinned ? 2 : 0) + (a.intensity ?? 0) * 0.5 + (a.confidence ?? 0.5)
      const scoreB = (b.isPinned ? 2 : 0) + (b.intensity ?? 0) * 0.5 + (b.confidence ?? 0.5)
      return scoreB - scoreA
    })
    .slice(0, limit)

  return reranked.map((m) => {
    const s = m.summary.slice(0, MEMORY_SUMMARY_MAX_CHARS)
    return s.length < m.summary.length ? `${s}…` : s
  })
}

/**
 * Prefetch pack: preferences + latest psych_profile + last_session_summary.
 */
export async function getPrefetchPack(userId: string): Promise<{
  preferences: { styles: string[]; goals: string[]; boundaries: unknown }
  lastSessionSummary: string | null
  rollingState: unknown
}> {
  const [prefs, convState] = await Promise.all([
    prisma.userPreferences.findUnique({ where: { userId } }),
    prisma.conversationState.findUnique({ where: { userId } }),
  ])

  return {
    preferences: {
      styles: Array.isArray(prefs?.preferredStyles) ? (prefs.preferredStyles as string[]) : [],
      goals: Array.isArray(prefs?.goalsTop2) ? (prefs.goalsTop2 as string[]) : [],
      boundaries: prefs?.boundaries ?? {},
    },
    lastSessionSummary: convState?.lastSessionSummary ?? null,
    rollingState: convState?.rollingState ?? null,
  }
}

/**
 * Sync user preferences from onboarding + aiProfile.
 */
export async function syncUserPreferences(
  userId: string,
  data: { communicationStyle?: string[]; goals?: string[] }
): Promise<void> {
  const styles = data.communicationStyle ?? []
  const goals = (data.goals ?? []).slice(0, 2)

  await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      preferredStyles: styles,
      goalsTop2: goals,
      updatedAt: new Date(),
    },
    update: {
      preferredStyles: styles.length ? styles : undefined,
      goalsTop2: goals.length ? goals : undefined,
      updatedAt: new Date(),
    },
  })
}

/**
 * Обрабатывает memory_update от модели и пишет в memory_items по write policy.
 * Классификация topic по ключевым словам.
 */
export async function processMemoryUpdateToEpisodic(
  userId: string,
  facts: string[]
): Promise<void> {
  const TOPIC_KEYWORDS: Record<MemoryTopic, string[]> = {
    work: ['работа', 'начальник', 'коллеги', 'босс', 'увольнение', 'карьера', 'work', 'boss', 'job'],
    relationship: ['партнёр', 'отношения', 'конфликт', 'ссора', 'расставание', 'развод', 'близкий', 'relationship', 'partner', 'conflict'],
    anxiety: ['тревога', 'паника', 'страх', 'anxiety', 'panic', 'fear'],
    sleep: ['сон', 'усталость', 'бессонниц', 'выспаться', 'sleep', 'tired', 'insomnia'],
    'self-worth': ['самооцен', 'самокритик', 'self-worth', 'esteem'],
    planning: ['план', 'цель', 'plan', 'goal'],
    loneliness: ['одиночество', 'одинок', 'lonely', 'loneliness'],
    burnout: ['выгорание', 'burnout', 'истощение'],
    other: [],
  }

  for (const fact of facts) {
    if (!fact || fact.trim().length < 10 || fact.length > 500) continue

    const lower = fact.toLowerCase()
    let topic: MemoryTopic = 'other'
    for (const [t, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (t === 'other') continue
      if (keywords.some((kw) => lower.includes(kw))) {
        topic = t as MemoryTopic
        break
      }
    }

    const importantTopics: MemoryTopic[] = ['relationship', 'anxiety', 'sleep', 'loneliness', 'burnout', 'work']
    const intensity = importantTopics.includes(topic) ? 2 : 1

    await writeMemoryIfEligible({
      userId,
      type: 'event',
      topic,
      summary: fact.trim().slice(0, 500),
      intensity,
      confidence: 0.8,
      ttlDays: topic === 'work' || topic === 'relationship' ? 180 : 90,
    })
  }
}

/**
 * Подсчёт сообщений пользователя по темам за последние 7 дней.
 * Для premium-триггеров P2 (отношения), P3 (сон/усталость).
 */
export async function getTopicCounts7d(userId: string): Promise<{
  relationshipTopicCount7d: number
  sleepTopicCount7d: number
}> {
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const userMessages = await prisma.cbtMessage.findMany({
    where: {
      role: 'user',
      conversation: { userId },
      createdAt: { gte: since },
    },
    select: { content: true },
  })

  const RELATIONSHIP_KEYWORDS = [
    'партнёр', 'партнер', 'отношения', 'конфликт', 'ссора', 'расставание', 'развод',
    'близкий', 'любовь', 'семья', 'муж', 'жена', 'boyfriend', 'girlfriend', 'relationship',
  ]
  const SLEEP_KEYWORDS = [
    'сон', 'усталость', 'устал', 'бессонниц', 'уснуть', 'выспаться', 'энергия',
    'выгорание', 'sleep', 'tired', 'insomnia', 'устала',
  ]

  let relationshipTopicCount7d = 0
  let sleepTopicCount7d = 0

  for (const msg of userMessages) {
    try {
      const text = getDecryptedContent(msg.content).toLowerCase()
      if (RELATIONSHIP_KEYWORDS.some((kw) => text.includes(kw))) relationshipTopicCount7d++
      if (SLEEP_KEYWORDS.some((kw) => text.includes(kw))) sleepTopicCount7d++
    } catch {
      // skip decryption errors
    }
  }

  return { relationshipTopicCount7d, sleepTopicCount7d }
}

/**
 * Update conversation state after session.
 */
export async function updateConversationState(
  userId: string,
  lastSessionSummary: string,
  rollingState?: { lastMood?: number; lastStress?: number; arousal?: number; valence?: number }
): Promise<void> {
  await prisma.conversationState.upsert({
    where: { userId },
    create: {
      userId,
      lastSessionSummary,
      lastSessionAt: new Date(),
      rollingState: rollingState ?? {},
      updatedAt: new Date(),
    },
    update: {
      lastSessionSummary,
      lastSessionAt: new Date(),
      rollingState: rollingState ?? undefined,
      updatedAt: new Date(),
    },
  })
}
