'use client'

import { getTrend, normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import Link from 'next/link'
import { format, parseISO, isValid } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { DynamicsMetricAreaChart } from '@/shared/components/profile/DynamicsMetricAreaChart'
import { filterHistoryByRollingDays } from '@/shared/lib/dynamics-date-window'
import { Heart, Flame, Zap, Users, Activity } from 'lucide-react'

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
  { key: 'emotion' as const, stroke: '#db2777', icon: Heart },
  { key: 'stress' as const, stroke: '#ea580c', icon: Flame },
  { key: 'energy' as const, stroke: '#059669', icon: Zap },
  { key: 'support' as const, stroke: '#2563eb', icon: Users },
] as const

export function TrendSummaryCard({ history, onDetailsClick, locale }: TrendSummaryCardProps) {
  const t = useTranslations('profile')
  const history7d = filterHistoryByRollingDays(history, 7)

  if (history7d.length === 0) {
    return (
      <section>
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-3">
          {t('trend.title')}
        </h2>
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-7 h-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="text-[15px] text-slate-600 mb-6">
            {t('trend.noData')}
          </p>
          <Link
            href={`/${locale}/chat`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all text-[15px] shadow-lg shadow-slate-900/15"
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
      return { dateKey: format(dayDate, 'yyyy-MM-dd'), value: normalizeScoreTo100(r[key]) }
    })
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">{t('trend.title')}</h2>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{t('trend.periodLabel')}</p>
      </div>

      <div className="rounded-[1.35rem] bg-slate-200/35 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:p-3">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {TREND_META.map((meta) => {
            const mKey = meta.key
            const label = t(`trend.metrics.${mKey}`)
            const data = toChartData(history7d, mKey)
            const values = data.map((d) => d.value)
            const trend = getTrend(values)
            const trendLabel = t(`trend.directions.${mKey}.${trend}`)
            const stroke = meta.stroke
            const Icon = meta.icon
            const lastVal = data.length ? data[data.length - 1].value : null
            return (
              <div
                key={mKey}
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 border-t-[3px] bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/50"
                style={{ borderTopColor: stroke }}
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100/90 bg-gradient-to-b from-slate-50/80 to-white px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm"
                      style={{
                        background: `linear-gradient(145deg, ${stroke}18, ${stroke}08)`,
                        color: stroke,
                      }}
                    >
                      <Icon className="h-[19px] w-[19px]" strokeWidth={2} aria-hidden />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-800 leading-snug">{label}</p>
                  </div>
                  {lastVal != null && (
                    <span
                      className="text-[26px] font-bold tabular-nums leading-none tracking-tight"
                      style={{ color: stroke }}
                    >
                      {Math.round(lastVal)}
                    </span>
                  )}
                </div>
                <div className="bg-white px-3 pb-3 pt-2">
                  <div className="rounded-xl bg-slate-50/90 px-2 pt-1.5 ring-1 ring-slate-200/60">
                    <DynamicsMetricAreaChart
                      data={data}
                      stroke={stroke}
                      metricLabel={label}
                      size="comfortable"
                      tickFill="#64748b"
                      gridStroke="#e2e8f0"
                      locale={locale}
                    />
                  </div>
                  <p className="mt-3 text-[12px] font-medium uppercase tracking-wide text-slate-500">{trendLabel}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center pt-1">
        <button
          onClick={onDetailsClick}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-[15px] font-medium text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
        >
          {t('trend.details')}
        </button>
      </div>
    </section>
  )
}
