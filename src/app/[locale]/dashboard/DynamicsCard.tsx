'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { format } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import { DynamicsMetricAreaChart } from '@/shared/components/profile/DynamicsMetricAreaChart'

type Variant = 'dark' | 'light'

interface DynamicsCardProps {
  variant?: Variant
}

type RatingRow = {
  id: string
  date: string | Date
  emotion?: number | null
  stress?: number | null
  energy?: number | null
  support?: number | null
}

const ROW_METRICS = [
  { key: 'emotion' as const, labelKey: 'dynamics.emotion' as const, stroke: '#f43f5e' },
  { key: 'stress' as const, labelKey: 'dynamics.stress' as const, stroke: '#f59e0b' },
  { key: 'energy' as const, labelKey: 'dynamics.energy' as const, stroke: '#10b981' },
  { key: 'support' as const, labelKey: 'dynamics.metrics.support' as const, stroke: '#0ea5e9', icon: Users },
]

export function DynamicsCard({ variant = 'dark' }: DynamicsCardProps) {
  const t = useTranslations('profile')
  const locale = useLocale()
  const dfLocale = locale === 'ru' ? ru : enUS
  const [data, setData] = useState<RatingRow[]>([])

  useEffect(() => {
    fetch('/api/dashboard/dynamics', { credentials: 'include', cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.ratings) setData(res.ratings)
      })
  }, [])

  const isLight = variant === 'light'

  const chartRows = useMemo(() => {
    return ROW_METRICS.map((m) => ({
      ...m,
      series: data.map((r) => ({
        day: format(new Date(r.date), 'EEE', { locale: dfLocale }),
        value: normalizeScoreTo100(r[m.key]),
      })),
      tooltipLabel: t(`dynamics.metrics.${m.key}`),
    }))
  }, [data, dfLocale, t])

  if (!data.length) {
    return (
      <section>
        <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
          {t('dynamics.title')}
        </h2>
        <div
          className={`rounded-2xl p-8 text-center ${isLight ? 'bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#eee]' : 'bg-daisy-900/40 border border-daisy-800'}`}
        >
          <div
            className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isLight ? 'bg-[#f5f5f5]' : 'bg-daisy-800/50'}`}
          >
            <span className="text-2xl">📊</span>
          </div>
          <p className={`text-[15px] ${isLight ? 'text-[#6b6b6b]' : 'text-daisy-400'}`}>{t('dynamics.noData')}</p>
        </div>
      </section>
    )
  }

  const labelClass = isLight ? 'text-[#5a5a5a]' : 'text-daisy-300'
  const chartBg = isLight ? 'bg-white border border-[#ececf0]' : 'bg-daisy-900/30 border border-daisy-700/50'
  const tickFill = isLight ? '#94a3b8' : '#94a3b8'
  const gridStroke = isLight ? '#e8e8ec' : 'rgba(148,163,184,0.25)'

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">{t('dynamics.title')}</h2>
      <div
        className={`rounded-2xl overflow-hidden ${isLight ? 'bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)] border border-[#ececf0]' : 'bg-daisy-900/50 border border-daisy-800 shadow-xl'}`}
      >
        <div
          className={`px-6 py-4 ${isLight ? 'bg-gradient-to-r from-[#fafbfc] to-[#f4f6f8] border-b border-[#ececf0]' : 'border-b border-daisy-800'}`}
        >
          <span className={`text-sm font-semibold tracking-tight ${isLight ? 'text-[#1e293b]' : 'text-daisy-100'}`}>
            {t('dynamics.last7days')}
          </span>
        </div>
        <div className="p-6 space-y-7">
          {chartRows.map((row, idx) => {
            const Icon = row.icon
            return (
              <div key={row.key} className="flex flex-col gap-2.5">
                <div className={`text-[13px] font-medium flex items-center gap-1.5 ${labelClass}`}>
                  <span className="text-[#b0b0b0] w-4 tabular-nums">{idx + 1}.</span>
                  {Icon ? <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" aria-hidden /> : null}
                  {t(row.labelKey)}
                </div>
                <div
                  className={`w-full rounded-2xl overflow-hidden px-1 pt-1 pb-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${chartBg}`}
                >
                  <DynamicsMetricAreaChart
                    data={row.series}
                    stroke={row.stroke}
                    metricLabel={row.tooltipLabel}
                    size="comfortable"
                    tickFill={tickFill}
                    gridStroke={gridStroke}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
