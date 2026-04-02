export type ScoreStatus = {
  label: string
  tailwind: string
  bg: string
}

export function getStressStatus(bsi: number): ScoreStatus {
  if (bsi < 45) return { label: 'В норме', tailwind: 'text-green-600', bg: 'bg-green-50' }
  if (bsi < 65) return { label: 'Повышен', tailwind: 'text-yellow-600', bg: 'bg-yellow-50' }
  return { label: 'Критический', tailwind: 'text-red-600', bg: 'bg-red-50' }
}

export function getEmotionStatus(esi: number): ScoreStatus {
  if (esi < 40) return { label: 'Нестабильно', tailwind: 'text-orange-500', bg: 'bg-orange-50' }
  if (esi < 60) return { label: 'В норме', tailwind: 'text-green-600', bg: 'bg-green-50' }
  return { label: 'Стабильно', tailwind: 'text-green-700', bg: 'bg-green-50' }
}

export function getSupportStatus(ssi: number): ScoreStatus {
  if (ssi < 40) return { label: 'Недостаточная', tailwind: 'text-red-500', bg: 'bg-red-50' }
  return { label: 'Достаточная', tailwind: 'text-green-600', bg: 'bg-green-50' }
}

export function getResourceStatus(mri: number): ScoreStatus {
  if (mri < 40) return { label: 'Истощение', tailwind: 'text-red-600', bg: 'bg-red-50' }
  if (mri < 60) return { label: 'Снижен', tailwind: 'text-yellow-600', bg: 'bg-yellow-50' }
  return { label: 'В норме', tailwind: 'text-green-600', bg: 'bg-green-50' }
}

export type TrendDirection = 'up' | 'down' | 'stable'

export function getTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'stable'
  const first = values.slice(0, 2).reduce((a, b) => a + b, 0) / 2
  const last = values.slice(-2).reduce((a, b) => a + b, 0) / 2
  const delta = last - first
  if (delta > 3) return 'up'
  if (delta < -3) return 'down'
  return 'stable'
}

export function getTrendLabel(
  metric: 'emotion' | 'stress' | 'energy' | 'support',
  trend: TrendDirection
): string {
  const map = {
    emotion: {
      up: '↑ Стало лучше к концу недели',
      down: '↓ Немного ухудшилось',
      stable: '→ Остаётся стабильным',
    },
    stress: {
      up: '↓ Стресс снизился',
      down: '↑ Стресс вырос',
      stable: '→ Остаётся стабильным',
    },
    energy: {
      up: '↑ Энергия выросла',
      down: '↓ Немного снизилась',
      stable: '→ Остаётся стабильным',
    },
    support: {
      up: '↑ Постепенно растёт',
      down: '↓ Снизилась',
      stable: '→ Остаётся стабильным',
    },
  }
  return map[metric][trend]
}

export function generateProfileSummary(bsi: number, esi: number, mri: number): string {
  if (bsi >= 65 && mri <= 40)
    return 'Сейчас у тебя повышен стресс и снижена энергия. Это похоже на начальную стадию выгорания.'
  if (esi <= 35)
    return 'Эмоциональное состояние сейчас нестабильно. Daisy рядом — давай замедлимся 🤍'
  if (bsi >= 65) return 'Стресс сейчас выше нормы. Телу и уму нужна поддержка.'
  if (mri <= 40) return 'Ресурс снижен. Стоит обратить внимание на восстановление.'
  return 'Общее состояние в норме. Продолжай следить за собой 🤍'
}

export function getWeeklyDelta(
  current: number,
  previous: number
): {
  delta: number
  label: string
  tailwind: string
} {
  const delta = Math.round(current - previous)
  if (delta < -2) return { delta, label: `Снизился на ${Math.abs(delta)}%`, tailwind: 'text-green-600' }
  if (delta > 2) return { delta, label: `Вырос на ${Math.abs(delta)}%`, tailwind: 'text-red-500' }
  return { delta, label: 'Остаётся стабильным', tailwind: 'text-yellow-600' }
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
