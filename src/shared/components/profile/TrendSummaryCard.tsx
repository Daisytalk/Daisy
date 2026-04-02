'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { getTrend, normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import Link from 'next/link'
import { format } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { useTranslations } from 'next-intl'

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

export function TrendSummaryCard({ history, onDetailsClick, locale }: TrendSummaryCardProps) {
  const t = useTranslations('profile')
  const METRICS = [
    { key: 'emotion' as const, label: t('trend.metrics.emotion') },
    { key: 'stress' as const, label: t('trend.metrics.stress') },
    { key: 'energy' as const, label: t('trend.metrics.energy') },
    { key: 'support' as const, label: t('trend.metrics.support') },
  ]
  const history7d = history.slice(-7)

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
      return { day: format(r.date, 'EEE', { locale: dfLocale }), value: normalizeScoreTo100(r[key]) }
    })
  }

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
        {t('trend.title')}
      </h2>
      <div className="rounded-2xl bg-white border border-[#eee] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
        <div className="divide-y divide-[#f0f0f0]">
          {METRICS.map((m) => {
            const data = toChartData(history7d, m.key)
            const values = data.map((d) => d.value)
            const trend = getTrend(values)
            const trendLabel = t(`trend.directions.${m.key}.${trend}`)
            return (
              <div key={m.key} className="px-6 py-5">
                <p className="text-[14px] font-medium text-[#6b6b6b] mb-3">{m.label}</p>
                <div className="flex items-center gap-4">
                  <div className="w-36 h-12 shrink-0 rounded-lg bg-[#f8f8f8] p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#5ba3c6"
                          strokeWidth={2.5}
                          dot={false}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-[14px] font-medium text-[#4a4a4a]">{trendLabel}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-6 py-4 flex justify-center bg-gradient-to-r from-[#fafafa] to-[#f5f5f5] border-t border-[#f0f0f0]">
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
