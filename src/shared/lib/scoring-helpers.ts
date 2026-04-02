export type MetricStatus = {
  tailwind: string
  bg: string
  level: string
}

export function getStressStatus(bsi: number): MetricStatus {
  if (bsi < 45) return { tailwind: 'text-green-600', bg: 'bg-green-50', level: 'normal' }
  if (bsi < 65) return { tailwind: 'text-yellow-600', bg: 'bg-yellow-50', level: 'elevated' }
  return { tailwind: 'text-red-600', bg: 'bg-red-50', level: 'critical' }
}

export function getEmotionStatus(esi: number): MetricStatus {
  if (esi < 40) return { tailwind: 'text-orange-500', bg: 'bg-orange-50', level: 'unstable' }
  if (esi < 60) return { tailwind: 'text-green-600', bg: 'bg-green-50', level: 'normal' }
  return { tailwind: 'text-green-700', bg: 'bg-green-50', level: 'stable' }
}

export function getSupportStatus(ssi: number): MetricStatus {
  if (ssi < 40) return { tailwind: 'text-red-500', bg: 'bg-red-50', level: 'low' }
  return { tailwind: 'text-green-600', bg: 'bg-green-50', level: 'adequate' }
}

export function getResourceStatus(mri: number): MetricStatus {
  if (mri < 40) return { tailwind: 'text-red-600', bg: 'bg-red-50', level: 'depleted' }
  if (mri < 60) return { tailwind: 'text-yellow-600', bg: 'bg-yellow-50', level: 'reduced' }
  return { tailwind: 'text-green-600', bg: 'bg-green-50', level: 'normal' }
}

export type TrendDirection = 'up' | 'down' | 'stable'

/** Daily check-in metrics: legacy 1–5 in DB, or 0–100 index. */
export function normalizeScoreTo100(v: number | null): number {
  if (v == null) return 50
  if (v >= 1 && v <= 5) return v * 20
  return Math.max(0, Math.min(100, v))
}

export function getTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'stable'
  const first = values.slice(0, 2).reduce((a, b) => a + b, 0) / 2
  const last = values.slice(-2).reduce((a, b) => a + b, 0) / 2
  const delta = last - first
  const threshold = values.some((x) => x > 5) ? 10 : 3
  if (delta > threshold) return 'up'
  if (delta < -threshold) return 'down'
  return 'stable'
}

export type ProfileSummaryKey = 'burnout' | 'emotionUnstable' | 'stressHigh' | 'resourceLow' | 'ok'

export function getProfileSummaryKey(bsi: number, esi: number, mri: number): ProfileSummaryKey {
  if (bsi >= 65 && mri <= 40) return 'burnout'
  if (esi <= 35) return 'emotionUnstable'
  if (bsi >= 65) return 'stressHigh'
  if (mri <= 40) return 'resourceLow'
  return 'ok'
}

export type WeeklyDeltaKind = 'down' | 'up' | 'stable'

export function getWeeklyDelta(
  current: number,
  previous: number
): {
  delta: number
  kind: WeeklyDeltaKind
  absDelta: number
  tailwind: string
} {
  const delta = Math.round(current - previous)
  const absDelta = Math.abs(delta)
  if (delta < -2) return { delta, kind: 'down', absDelta, tailwind: 'text-green-600' }
  if (delta > 2) return { delta, kind: 'up', absDelta, tailwind: 'text-red-500' }
  return { delta, kind: 'stable', absDelta: 0, tailwind: 'text-yellow-600' }
}

export function getBestAndWorstDay(
  data: { day: string; value: number }[]
): { best: string; worst: string } {
  if (!data.length) return { best: '—', worst: '—' }
  const best = data.reduce((a, b) => (a.value > b.value ? a : b))
  const worst = data.reduce((a, b) => (a.value < b.value ? a : b))
  return { best: best.day, worst: worst.day }
}

/** Для стресса меньше = лучше; для эмоций/энергии/поддержки больше = лучше. */
export function getBestAndWorstDayForMetric(
  metric: 'emotion' | 'stress' | 'energy' | 'support',
  data: { day: string; value: number }[]
): { best: string; worst: string } {
  if (!data.length) return { best: '—', worst: '—' }
  if (metric === 'stress') {
    const bestEntry = data.reduce((a, b) => (a.value < b.value ? a : b))
    const worstEntry = data.reduce((a, b) => (a.value > b.value ? a : b))
    return { best: bestEntry.day, worst: worstEntry.day }
  }
  return getBestAndWorstDay(data)
}
