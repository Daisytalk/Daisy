'use client'

import { getTrend, normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import Link from 'next/link'
import { format, parseISO, isValid } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { DynamicsMetricAreaChart } from '@/shared/components/profile/DynamicsMetricAreaChart'
import { filterHistoryByRollingDays } from '@/shared/lib/dynamics-date-window'

interface HistoryRecord {
  id: string
  date: Date
  emotion: number | null
  stress: number | null
  energy: number | null
  support: number | null
}

interface TrendSummaryCardProps {
  history: HistoryRecord[]
  onDetailsClick: () => void
  locale: string
}

const TREND_STROKES: Record<'emotion' | 'stress' | 'energy' | 'support', string> = {
  emotion: '#f43f5e',
  stress: '#f59e0b',
  energy: '#10b981',
  support: '#0ea5e9',
}

export function TrendSummaryCard({ history, onDetailsClick, locale }: TrendSummaryCardProps) {
  const t = useTranslations('profile')
  const METRICS = [
    { key: 'emotion' as const, label: t('trend.metrics.emotion') },
    { key: 'stress' as const, label: t('trend.metrics.stress') },
    { key: 'energy' as const, label: t('trend.metrics.energy') },
    { key: 'support' as const, label: t('trend.metrics.support') },
  ]
  const history7d = filterHistoryByRollingDays(history, 7)

  if (history7d.length === 0) {
    return (
      <section>
        <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
          {t('trend.title')}
        </h2>
        <div className="rounded-2xl bg-white border border-[#eee] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f8f8f8] mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-[15px] text-[#6b6b6b] mb-6">
            {t('trend.noData')}
          </p>
          <Link
            href={`/${locale}/chat`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-[#5ba3c6] to-[#4a8fb3] text-white font-medium hover:from-[#4a8fb3] hover:to-[#3d7a9e] transition-all text-[15px] shadow-[0_4px_14px_rgba(91,163,198,0.3)]"
          >
            {t('trend.startCheckin')}
          </Link>
        </div>
      </section>
    )
  }

  const dfLocale = locale === 'ru' ? ru : enUS
  const toChartData = (records: HistoryRecord[], key: 'emotion' | 'stress' | 'energy' | 'support') => {
    return records.map((r) => {
      const raw = r.date as unknown
      const d =
        raw instanceof Date
          ? raw
          : typeof raw === 'string'
            ? parseISO(raw)
            : new Date(raw as string)
      const dayDate = isValid(d) ? d : new Date()
      return { day: format(dayDate, 'EEE', { locale: dfLocale }), value: normalizeScoreTo100(r[key]) }
    })
  }

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
        {t('trend.title')}
      </h2>
      <div className="rounded-2xl bg-white border border-[#e8eaef] shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03] overflow-hidden hover:shadow-[0_12px_44px_-14px_rgba(15,23,42,0.14)] transition-shadow">
        <div className="divide-y divide-[#f0f0f3]">
          {METRICS.map((m) => {
            const data = toChartData(history7d, m.key)
            const values = data.map((d) => d.value)
            const trend = getTrend(values)
            const trendLabel = t(`trend.directions.${m.key}.${trend}`)
            const stroke = TREND_STROKES[m.key]
            return (
              <div key={m.key} className="px-6 py-5">
                <p className="text-[14px] font-semibold text-[#475569] mb-3">{m.label}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div
                    className="flex-1 min-w-0 rounded-2xl bg-white border border-[#ececf0] px-2 pt-2 pb-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] border-l-[3px]"
                    style={{ borderLeftColor: stroke }}
                  >
                    <DynamicsMetricAreaChart
                      data={data}
                      stroke={stroke}
                      metricLabel={m.label}
                      size="comfortable"
                      tickFill="#64748b"
                      gridStroke="#e2e8f0"
                    />
                  </div>
                  <span className="text-[14px] font-medium text-[#4a4a4a] shrink-0 sm:max-w-[40%]">{trendLabel}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-6 py-4 flex justify-center bg-gradient-to-r from-[#fafbfc] to-[#f4f6f8] border-t border-[#f0f0f3]">
          <button
            onClick={onDetailsClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#5ba3c6] to-[#4a8fb3] hover:from-[#4a8fb3] hover:to-[#3d7a9e] text-white font-medium text-[15px] transition-all shadow-[0_4px_14px_rgba(91,163,198,0.25)]"
          >
            {t('trend.details')}
          </button>
        </div>
      </div>
    </section>
  )
}
