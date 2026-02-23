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

/** Извлекает yes/no из ответа yes-no-text (value: 'yes' | 'no') */
function yesNo(responses: OnboardingResponses, questionId: string): 0 | 1 {
  const a = getAnswer(responses, questionId)
  if (!a || typeof a !== 'object' || Array.isArray(a)) return 0
  const v = (a as Record<string, unknown>).value
  return v === 'yes' || v === 'Да' ? 1 : 0
}

/**
 * Вычисляет психопрофиль из ответов онбординга.
 * Формулы по PDF: ESI, SSI, BSI, PVI, MRI, risk_level.
 */
export function computePsychProfile(responses: OnboardingResponses): PsychProfileResult {
  const num = (q: string, defaultVal = 3): number => {
    const a = getAnswer(responses, q)
    if (typeof a === 'number') return a
    if (typeof a === 'string' && /^\d+$/.test(a)) return parseInt(a, 10)
    return defaultVal
  }

  const mood_today = num('mood_today')
  const work_state = num('work_state')
  const family_support = num('family_support')
  const solo_comfort = num('solo_comfort')
  const physical_state = num('physical_state')
  const emo_state = num('emo_state')
  const leisure = num('leisure')
  const housing = num('housing')
  const finance = num('finance')

  const family_history_yes = yesNo(responses, 'family_history')
  const chronic_yes = yesNo(responses, 'chronic')
  const addiction_yes = yesNo(responses, 'addiction')

  const relRaw = getAnswer(responses, 'relationships')
  let rel_quality: number | null = null
  if (relRaw && typeof relRaw === 'object' && !Array.isArray(relRaw)) {
    const r = relRaw as Record<string, unknown>
    if ((r.value === 'yes' || r.value === 'Да') && typeof r.rel_quality === 'number') {
      rel_quality = r.rel_quality
    }
  }

  const rel = rel_quality != null ? norm(rel_quality) : 0
  const social_support = norm(family_support) // family_support как proxy для social_support

  const flags: Record<string, boolean> = {}
  if (physical_state <= 2) flags.sleep_issues = true
  if (emo_state <= 2) flags.high_anxiety = true

  // ESI = 0.20×mood + 0.30×emo + 0.20×solo_comfort + 0.05×rel + 0.05×family + 0.05×social − 0.05×addiction_yes
  const ESI_raw = 0.20 * norm(mood_today) + 0.30 * norm(emo_state) + 0.20 * norm(solo_comfort)
    + 0.05 * rel + 0.05 * norm(family_support) + 0.05 * social_support - 0.05 * addiction_yes
  const ESI = 100 * clamp01(ESI_raw)

  // SSI = 0.20×rel + 0.20×family_support + 0.30×social_support (normalize)
  const ssiSum = 0.20 * rel + 0.20 * norm(family_support) + 0.30 * social_support
  const SSI = 100 * clamp01(ssiSum / 0.7)

  // BSI = 0.30×inv(work) + 0.20×inv(emo) + 0.10×inv(mood) + 0.10×inv(physical) + 0.10×inv(leisure) + 0.15×inv(finance) + 0.05×inv(housing) + 0.05×addiction_yes
  const bsiRaw = 0.30 * inv(work_state) + 0.20 * inv(emo_state) + 0.10 * inv(mood_today) + 0.10 * inv(physical_state)
    + 0.10 * inv(leisure) + 0.15 * inv(finance) + 0.05 * inv(housing) + 0.05 * addiction_yes
  const BSI = 100 * clamp01(bsiRaw / 1.05)

  // PVI = 0.20×inv(physical) + 0.35×chronic_yes + 0.20×family_history_yes + 0.45×addiction_yes
  const pviRaw = 0.20 * inv(physical_state) + 0.35 * chronic_yes + 0.20 * family_history_yes + 0.45 * addiction_yes
  const PVI = 100 * clamp01(pviRaw / 1.2)

  // MRI = 0.35×leisure + 0.20×finance + 0.15×housing + 0.10×work + 0.20×mood_today
  const mriRaw = 0.35 * norm(leisure) + 0.20 * norm(finance) + 0.15 * norm(housing) + 0.10 * norm(work_state) + 0.20 * norm(mood_today)
  const MRI = 100 * clamp01(mriRaw)

  // risk_level: critical (BSI≥80 или ESI≤25 или addiction_yes && ESI≤35), high, medium, low
  let riskLevel: RiskLevel = 'low'
  if (BSI >= 80 || ESI <= 25 || (addiction_yes === 1 && ESI <= 35)) riskLevel = 'critical'
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
