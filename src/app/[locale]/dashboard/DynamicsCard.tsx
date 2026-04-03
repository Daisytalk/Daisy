'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { format, parseISO, isValid } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { Heart, Flame, Zap, Users } from 'lucide-react'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import { DynamicsMetricAreaChart } from '@/shared/components/profile/DynamicsMetricAreaChart'

type Variant = 'dark' | 'light'

interface DynamicsCardProps {
  variant?: Variant
  /** Profile: pass last-7d check-ins from the server so charts render immediately and match `/profile` history. */
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
  { key: 'emotion' as const, labelKey: 'dynamics.emotion' as const, stroke: '#e11d48', icon: Heart },
  { key: 'stress' as const, labelKey: 'dynamics.stress' as const, stroke: '#d97706', icon: Flame },
  { key: 'energy' as const, labelKey: 'dynamics.energy' as const, stroke: '#059669', icon: Zap },
  { key: 'support' as const, labelKey: 'dynamics.metrics.support' as const, stroke: '#0284c7', icon: Users },
] as const

/** Asymmetric bento: wide–narrow / narrow–wide on md+. */
const BENTO_MD_COL = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7'] as const

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
        day: format(toDate(r.date), 'EEE', { locale: dfLocale }),
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

  const labelClass = isLight ? 'text-slate-700' : 'text-daisy-300'
  const tickFill = isLight ? '#64748b' : '#94a3b8'
  const gridStroke = isLight ? '#e2e8f0' : 'rgba(148,163,184,0.28)'

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">{t('dynamics.title')}</h2>
      <div
        className={`rounded-3xl overflow-hidden ${
          isLight
            ? 'border border-[#e2e8f0] bg-gradient-to-b from-slate-50/90 via-white to-white shadow-[0_12px_48px_-16px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/50'
            : 'bg-daisy-900/50 border border-daisy-800 shadow-xl'
        }`}
      >
        <div
          className={`px-5 py-4 sm:px-6 sm:py-4 ${isLight ? 'border-b border-slate-200/70 bg-gradient-to-r from-white via-slate-50/50 to-white' : 'border-b border-daisy-800'}`}
        >
          <span className={`text-sm font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-daisy-100'}`}>
            {t('dynamics.last7days')}
          </span>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
            {chartRows.map((row, idx) => {
              const Icon = row.icon
              const lastVal = row.series.length ? row.series[row.series.length - 1].value : null
              const mdCol = BENTO_MD_COL[idx]
              return (
                <div
                  key={row.key}
                  className={`col-span-12 ${mdCol} flex flex-col min-h-0`}
                >
                  <div
                    className={`relative flex h-full flex-col rounded-2xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:shadow-md ${
                      isLight
                        ? 'border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/90 ring-1 ring-slate-200/40'
                        : 'border-daisy-700/50 bg-daisy-900/30'
                    }`}
                  >
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-full opacity-90"
                      style={{ background: row.stroke }}
                      aria-hidden
                    />
                    <div className="pl-3.5 flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                          style={{
                            background: `${row.stroke}14`,
                            color: row.stroke,
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6)`,
                          }}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                        </div>
                        <span className={`text-[13px] font-semibold leading-snug ${labelClass}`}>{t(row.labelKey)}</span>
                      </div>
                      {lastVal != null && (
                        <span
                          className="text-[22px] font-bold tabular-nums leading-none tracking-tight shrink-0"
                          style={{ color: row.stroke }}
                        >
                          {Math.round(lastVal)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`min-w-0 rounded-xl px-1.5 pt-1 pb-0.5 ${
                        isLight ? 'bg-slate-50/80 border border-slate-100' : 'bg-daisy-950/20 border border-daisy-800/40'
                      }`}
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
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
