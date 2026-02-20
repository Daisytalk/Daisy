/**
 * Scoring system for Daisy (НОВЫЙ ОНБОРДИНГ+СКОРИНГ.docx)
 * Индексы: ESI, BSI, SSI, PVI, MRI; risk_level; психотипы
 */

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface PsychProfileResult {
  ESI: number
  BSI: number
  SSI: number
  PVI: number
  MRI: number
  riskLevel: RiskLevel
  cluster?: string
  flags?: Record<string, boolean>
}

type OnboardingResponses = Record<string, unknown> | { questionId: string; answer: unknown }[]

function getAnswer(responses: OnboardingResponses, questionId: string): unknown {
  if (Array.isArray(responses)) {
    const item = responses.find((r) => r.questionId === questionId)
    return item?.answer
  }
  return (responses as Record<string, unknown>)[questionId]
}

/** Нормализация 1–5 → 0–1 (чем выше, тем лучше) */
function norm(value: number): number {
  if (typeof value !== 'number' || value < 1 || value > 5) return 0.5
  return Math.max(0, Math.min(1, (value - 1) / 4))
}

/** Инверсия для негативных шкал (стресс/выгорание) */
function inv(value: number): number {
  return 1 - norm(value)
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

/**
 * Вычисляет психопрофиль из ответов онбординга.
 * Адаптировано под текущие вопросы: mood_today, work_state, relationships,
 * family_support, solo_comfort, physical_state, emo_state.
 */
export function computePsychProfile(responses: OnboardingResponses): PsychProfileResult {
  const num = (q: string): number => {
    const a = getAnswer(responses, q)
    if (typeof a === 'number') return a
    if (typeof a === 'string' && /^\d+$/.test(a)) return parseInt(a, 10)
    return 3 // default middle
  }

  const mood_today = num('mood_today')
  const work_state = num('work_state')
  const family_support = num('family_support')
  const solo_comfort = num('solo_comfort')
  const physical_state = num('physical_state')
  const emo_state = num('emo_state')

  const relRaw = getAnswer(responses, 'relationships')
  let rel_quality: number | null = null
  if (relRaw && typeof relRaw === 'object' && !Array.isArray(relRaw)) {
    const r = relRaw as Record<string, unknown>
    if (r.value === 'Да' && typeof r.rel_quality === 'number') {
      rel_quality = r.rel_quality
    }
  }

  const flags: Record<string, boolean> = {}
  if (physical_state <= 2) flags.sleep_issues = true
  if (emo_state <= 2) flags.high_anxiety = true

  // ESI: эмоциональная стабильность (выше лучше)
  const esiWeight = 0.2 * norm(mood_today) + 0.3 * norm(emo_state) + 0.2 * norm(solo_comfort)
    + 0.05 * norm(family_support)
    + (rel_quality != null ? 0.05 * norm(rel_quality) : 0)
  const esiDenom = rel_quality != null ? 0.8 : 0.75
  const ESI = 100 * clamp01(esiWeight / esiDenom)

  // SSI: социальная поддержка (выше лучше)
  const ssiParts = [0.2 * norm(family_support)]
  if (rel_quality != null) ssiParts.push(0.2 * norm(rel_quality))
  const ssiSum = ssiParts.reduce((a, b) => a + b, 0)
  const ssiDenom = rel_quality != null ? 0.4 : 0.2
  const SSI = 100 * clamp01(ssiSum / ssiDenom)

  // BSI: стресс/выгорание (выше хуже)
  const bsiRaw = 0.3 * inv(work_state) + 0.2 * inv(emo_state) + 0.1 * inv(mood_today) + 0.1 * inv(physical_state)
  const BSI = 100 * clamp01(bsiRaw / 0.7)

  // PVI: физическая уязвимость (выше хуже) — только physical_state
  const PVI = 100 * clamp01(inv(physical_state))

  // MRI: ресурс/смыслы (выше лучше) — work_state + mood_today
  const MRI = 100 * clamp01(0.6 * norm(work_state) + 0.4 * norm(mood_today))

  // risk_level
  let riskLevel: RiskLevel = 'low'
  if (BSI >= 80 || ESI <= 25) riskLevel = 'critical'
  else if (BSI >= 65 || ESI <= 40) riskLevel = 'high'
  else if (BSI >= 45 || ESI <= 55) riskLevel = 'medium'

  // cluster (психотип по doc)
  let cluster: string | undefined
  if (BSI >= 65 && SSI >= 50) cluster = 'overloaded_perfectionist'
  else if (SSI < 40 && ESI < 50) cluster = 'anxious_introvert'
  else if (ESI < 45 && MRI < 45) cluster = 'emotionally_exhausted'
  else if (SSI >= 55 && BSI >= 55) cluster = 'socially_stable_but_overloaded'
  else if (ESI >= 60 && BSI < 50 && SSI >= 50) cluster = 'resourceful_user'

  return {
    ESI: Math.round(ESI * 10) / 10,
    BSI: Math.round(BSI * 10) / 10,
    SSI: Math.round(SSI * 10) / 10,
    PVI: Math.round(PVI * 10) / 10,
    MRI: Math.round(MRI * 10) / 10,
    riskLevel,
    cluster,
    flags: Object.keys(flags).length > 0 ? flags : undefined,
  }
}
