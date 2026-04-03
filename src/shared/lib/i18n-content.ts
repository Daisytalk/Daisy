import type { Locale } from '@/i18n'

export type AppLocale = Locale

export type MetricInsightBlock = {
  emotion: string
  stress: string
  energy: string
  support: string
}

function isMetricBlock(o: Record<string, unknown>): o is MetricInsightBlock {
  return (
    typeof o.emotion === 'string' &&
    typeof o.stress === 'string' &&
    typeof o.energy === 'string' &&
    typeof o.support === 'string'
  )
}

/** Читает dynamics_metric_insights: плоский legacy или { en, ru }. */
export function pickMetricInsightsFromDb(raw: unknown, locale: AppLocale): MetricInsightBlock | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const enRaw = o.en
  const ruRaw = o.ru
  if (
    enRaw &&
    ruRaw &&
    typeof enRaw === 'object' &&
    !Array.isArray(enRaw) &&
    typeof ruRaw === 'object' &&
    !Array.isArray(ruRaw)
  ) {
    const en = enRaw as Record<string, unknown>
    const ru = ruRaw as Record<string, unknown>
    const primary = locale === 'ru' ? ru : en
    const fallback = locale === 'ru' ? en : ru
    if (isMetricBlock(primary)) return primary
    if (isMetricBlock(fallback)) return fallback
    return null
  }
  if (isMetricBlock(o)) return o
  return null
}

export function pickWeeklySummary(summary: string, summaryI18n: unknown, locale: AppLocale): string {
  if (summaryI18n && typeof summaryI18n === 'object' && !Array.isArray(summaryI18n)) {
    const m = summaryI18n as Record<string, unknown>
    const v = m[locale] ?? m.en ?? m.ru
    if (typeof v === 'string' && v.trim()) return v
  }
  return summary
}

/** insights / recommendations: legacy string[] или { en, ru }. */
export function pickLocalizedStringArray(raw: unknown, locale: AppLocale): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x))
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    const arr = o[locale] ?? o.en ?? o.ru
    if (Array.isArray(arr)) return arr.map((x) => String(x))
  }
  return []
}
