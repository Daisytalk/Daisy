'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { format, parseISO, isValid } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { Heart, Flame, Zap, Users, BarChart3 } from 'lucide-react'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import { DynamicsMetricAreaChart } from '@/shared/components/profile/DynamicsMetricAreaChart'

type Variant = 'dark' | 'light'

interface DynamicsCardProps {
  variant?: Variant
  ratingsFromServer?: RatingRow[]
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
  { key: 'emotion' as const, labelKey: 'dynamics.emotion' as const, stroke: '#db2777', icon: Heart },
  { key: 'stress' as const, labelKey: 'dynamics.stress' as const, stroke: '#ea580c', icon: Flame },
  { key: 'energy' as const, labelKey: 'dynamics.energy' as const, stroke: '#059669', icon: Zap },
  { key: 'support' as const, labelKey: 'dynamics.metrics.support' as const, stroke: '#2563eb', icon: Users },
] as const

export function DynamicsCard({ variant = 'dark', ratingsFromServer }: DynamicsCardProps) {
  const t = useTranslations('profile')
  const locale = useLocale()
  const dfLocale = locale === 'ru' ? ru : enUS
  const [data, setData] = useState<RatingRow[]>(() => ratingsFromServer ?? [])

  useEffect(() => {
    let cancelled = false
    if (ratingsFromServer !== undefined && ratingsFromServer.length > 0) {
      setData(ratingsFromServer)
      return () => {
        cancelled = true
      }
    }
    fetch('/api/dashboard/dynamics', { credentials: 'include', cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (cancelled) return
        if (Array.isArray(res.ratings) && res.ratings.length > 0) {
          setData(res.ratings)
        } else if (ratingsFromServer !== undefined) {
          setData(ratingsFromServer)
        } else {
          setData([])
        }
      })
      .catch(() => {
        if (!cancelled) setData(ratingsFromServer ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [ratingsFromServer])

  const isLight = variant === 'light'

  const chartRows = useMemo(() => {
    const toDate = (d: string | Date) => {
      if (d instanceof Date) return d
      const parsed = parseISO(typeof d === 'string' ? d : String(d))
      return isValid(parsed) ? parsed : new Date(d)
    }
    return ROW_METRICS.map((m) => ({
      ...m,
      series: data.map((r) => ({
        dateKey: format(toDate(r.date), 'yyyy-MM-dd'),
        value: normalizeScoreTo100(r[m.key]),
      })),
      tooltipLabel: t(`dynamics.metrics.${m.key}`),
    }))
  }, [data, dfLocale, t])

  if (!data.length) {
    return (
      <section>
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-3">
          {t('dynamics.title')}
        </h2>
        <div
          className={`rounded-2xl p-8 text-center ${isLight ? 'bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] border border-slate-200/80' : 'bg-daisy-900/40 border border-daisy-800'}`}
        >
          <div
            className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-daisy-800/50 text-daisy-300'}`}
          >
            <BarChart3 className="w-7 h-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className={`text-[15px] ${isLight ? 'text-slate-600' : 'text-daisy-400'}`}>{t('dynamics.noData')}</p>
        </div>
      </section>
    )
  }

  const tickFill = isLight ? '#64748b' : '#94a3b8'
  const gridStroke = isLight ? '#e2e8f0' : 'rgba(148,163,184,0.28)'

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">{t('dynamics.title')}</h2>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{t('dynamics.last7days')}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-slate-200/90 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-sm">
          0–100
        </span>
      </div>

      <div
        className={`rounded-[1.35rem] p-2 sm:p-3 ${
          isLight ? 'bg-slate-200/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]' : 'bg-daisy-950/30'
        }`}
      >
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {chartRows.map((row) => {
            const Icon = row.icon
            const lastVal = row.series.length ? row.series[row.series.length - 1].value : null
            return (
              <div
                key={row.key}
                className={`group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 border-t-[3px] bg-white ${
                  isLight
                    ? 'shadow-[0_8px_40px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/50'
                    : 'border-daisy-700/50 bg-daisy-900/40'
                }`}
                style={{ borderTopColor: row.stroke }}
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100/90 bg-gradient-to-b from-slate-50/80 to-white px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm"
                      style={{
                        background: `linear-gradient(145deg, ${row.stroke}18, ${row.stroke}08)`,
                        color: row.stroke,
                      }}
                    >
                      <Icon className="h-[19px] w-[19px]" strokeWidth={2} aria-hidden />
                    </div>
                    <span className="text-[14px] font-semibold leading-snug text-slate-800">{t(row.labelKey)}</span>
                  </div>
                  {lastVal != null && (
                    <span
                      className="text-[26px] font-bold tabular-nums leading-none tracking-tight text-slate-900"
                      style={{ color: row.stroke }}
                    >
                      {Math.round(lastVal)}
                    </span>
                  )}
                </div>
                <div className={`px-3 pb-3 pt-2 ${isLight ? 'bg-white' : 'bg-daisy-950/20'}`}>
                  <div
                    className={`rounded-xl px-2 pt-1.5 ${isLight ? 'bg-slate-50/90 ring-1 ring-slate-200/60' : 'bg-daisy-950/30'}`}
                  >
                    <DynamicsMetricAreaChart
                      data={row.series}
                      stroke={row.stroke}
                      metricLabel={row.tooltipLabel}
                      size="comfortable"
                      tickFill={tickFill}
                      gridStroke={gridStroke}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
