'use client'

import { getTrend, normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import Link from 'next/link'
import { format, parseISO, isValid } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { DynamicsMetricAreaChart } from '@/shared/components/profile/DynamicsMetricAreaChart'
import { filterHistoryByRollingDays } from '@/shared/lib/dynamics-date-window'
import { Heart, Flame, Zap, Users } from 'lucide-react'

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

const TREND_META = [
  { key: 'emotion' as const, stroke: '#e11d48', icon: Heart },
  { key: 'stress' as const, stroke: '#d97706', icon: Flame },
  { key: 'energy' as const, stroke: '#059669', icon: Zap },
  { key: 'support' as const, stroke: '#0284c7', icon: Users },
] as const

const BENTO_MD_COL = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7'] as const

export function TrendSummaryCard({ history, onDetailsClick, locale }: TrendSummaryCardProps) {
  const t = useTranslations('profile')
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
      <div className="rounded-3xl border border-[#e2e8f0] bg-gradient-to-b from-slate-50/90 via-white to-white shadow-[0_12px_48px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/50 overflow-hidden">
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
            {TREND_META.map((meta, idx) => {
              const mKey = meta.key
              const label = t(`trend.metrics.${mKey}`)
              const data = toChartData(history7d, mKey)
              const values = data.map((d) => d.value)
              const trend = getTrend(values)
              const trendLabel = t(`trend.directions.${mKey}.${trend}`)
              const stroke = meta.stroke
              const Icon = meta.icon
              const lastVal = data.length ? data[data.length - 1].value : null
              const mdCol = BENTO_MD_COL[idx]
              return (
                <div key={mKey} className={`col-span-12 ${mdCol} flex min-h-0`}>
                  <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-200/40 transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                          style={{
                            background: `${stroke}14`,
                            color: stroke,
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                          }}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                        </div>
                        <p className="text-[14px] font-semibold text-slate-800 leading-snug">{label}</p>
                      </div>
                      {lastVal != null && (
                        <span
                          className="text-[20px] font-bold tabular-nums leading-none shrink-0"
                          style={{ color: stroke }}
                        >
                          {Math.round(lastVal)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-1.5 pt-1 pb-0.5 mb-3">
                      <DynamicsMetricAreaChart
                        data={data}
                        stroke={stroke}
                        metricLabel={label}
                        size="comfortable"
                        tickFill="#64748b"
                        gridStroke="#e2e8f0"
                      />
                    </div>
                    <p className="text-[13px] font-medium text-slate-600 leading-snug mt-auto">{trendLabel}</p>
                  </div>
                </div>
              )
            })}
          </div>
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
