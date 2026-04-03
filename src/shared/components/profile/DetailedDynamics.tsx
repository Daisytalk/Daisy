'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DynamicsMetricAreaChart,
  DYNAMICS_CHART_HEIGHT,
} from '@/shared/components/profile/DynamicsMetricAreaChart'
import { format, isValid } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { getBestAndWorstDayForMetric, normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import { filterHistoryByRollingDays, toHistoryDate } from '@/shared/lib/dynamics-date-window'
import { Heart, Flame, Zap, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface HistoryRecord {
  id: string
  date: Date
  emotion: number | null
  stress: number | null
  energy: number | null
  support: number | null
}

interface DetailedDynamicsProps {
  history: HistoryRecord[]
  locale: string
}

type Period = '7d' | '14d' | '30d'

const METRIC_THEMES = {
  emotion: { gradient: 'from-rose-400/30 to-pink-300/10', stroke: '#db2777', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  stress: { gradient: 'from-amber-400/30 to-orange-300/10', stroke: '#ea580c', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  energy: { gradient: 'from-emerald-400/30 to-teal-300/10', stroke: '#059669', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  support: { gradient: 'from-sky-400/30 to-blue-300/10', stroke: '#2563eb', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
} as const

export function DetailedDynamics({ history, locale }: DetailedDynamicsProps) {
  const t = useTranslations('profile')
  const METRICS_CONFIG = [
    { key: 'emotion' as const, label: t('dynamics.metrics.emotion'), icon: Heart },
    { key: 'stress' as const, label: t('dynamics.metrics.stress'), icon: Flame },
    { key: 'energy' as const, label: t('dynamics.metrics.energy'), icon: Zap },
    { key: 'support' as const, label: t('dynamics.metrics.support'), icon: Users },
  ]
  const [period, setPeriod] = useState<Period>('7d')
  const [insights, setInsights] = useState<{ emotion?: string; stress?: string; energy?: string; support?: string } | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(true)

  useEffect(() => {
    if (history.length === 0) {
      setInsights(null)
      setLoadingInsights(false)
      return
    }
    setLoadingInsights(true)
    fetch(`/api/account/dynamics-insights?period=${period}`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setInsights(d)
      })
      .catch(() => setInsights(null))
      .finally(() => setLoadingInsights(false))
  }, [period, history.length])

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    setLoadingInsights(true)
  }

  const filtered = useMemo(() => {
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
    return filterHistoryByRollingDays(history, days)
  }, [history, period])

  const chartSize = period === '30d' ? 'detailed' : 'comfortable'
  const emptyChartMinH = DYNAMICS_CHART_HEIGHT[chartSize]

  const dateLocale = locale === 'ru' ? ru : enUS

  const toChartData = (records: HistoryRecord[], key: 'emotion' | 'stress' | 'energy' | 'support') => {
    const dayFmt = period === '30d' ? 'd MMM' : 'EEE'
    return records.map((r) => {
      const d = toHistoryDate(r.date)
      const dayDate = isValid(d) ? d : new Date()
      return {
        dateKey: format(dayDate, 'yyyy-MM-dd'),
        day: format(dayDate, dayFmt, { locale: dateLocale }),
        value: normalizeScoreTo100(r[key]),
      }
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-fit">
        {(['7d', '14d', '30d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
              period === p
                ? 'bg-[#5ba3c6] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:bg-[#f5f5f5] hover:text-[#2d2d2d]'
            }`}
          >
            {p === '7d' ? t('dynamics.period7d') : p === '14d' ? t('dynamics.period14d') : t('dynamics.period30d')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
      {METRICS_CONFIG.map((m) => {
        const data = toChartData(filtered, m.key)
        const { best, worst } = getBestAndWorstDayForMetric(m.key, data)
        const Icon = m.icon
        const insightText = insights?.[m.key] || t('dynamics.analyzing')
        const theme = METRIC_THEMES[m.key]
        const hasData = data.length > 0
        return (
          <div
            key={m.key}
            className="overflow-hidden rounded-2xl border border-slate-200/90 border-t-[3px] bg-white shadow-[0_8px_28px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/40 transition-shadow hover:shadow-[0_12px_36px_-14px_rgba(15,23,42,0.14)]"
            style={{ borderTopColor: theme.stroke }}
          >
            <div className={`bg-gradient-to-br ${theme.gradient} px-6 pt-6 pb-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-6 h-6 ${theme.iconColor}`} />
                </div>
                <span className="text-[17px] font-semibold text-[#1a1a1a]">{m.label}</span>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="mb-5 rounded-2xl bg-white border border-slate-200/90 px-1 pt-1 pb-0.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] shrink-0">
                {hasData ? (
                  <DynamicsMetricAreaChart
                    data={data}
                    stroke={theme.stroke}
                    metricLabel={m.label}
                    size={chartSize}
                    compactTimeAxis={period === '30d'}
                    tickFill="#64748b"
                    gridStroke="#e2e8f0"
                    locale={locale}
                  />
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center text-[#64748b] border border-dashed border-[#e2e8f0] rounded-xl bg-[#f8fafc]/90"
                    style={{ minHeight: emptyChartMinH }}
                  >
                    <p className="text-[13px] font-semibold text-[#475569]">{t('dynamics.emptyChartTitle')}</p>
                    <p className="text-[12px] leading-snug max-w-[240px]">{t('dynamics.emptyChartHint')}</p>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#f8f8f8] to-[#f5f5f5] p-4 border border-[#eee]">
                <p className="text-[14px] text-[#4a4a4a] mb-2">
                  <span className="font-medium text-[#2d2d2d]">{t('dynamics.bestDay')}</span>{' '}
                  <span className="text-slate-600">{best}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-medium text-[#2d2d2d]">{t('dynamics.worstDay')}</span>{' '}
                  <span className="text-slate-600">{worst}</span>
                </p>
                <p className="text-[14px] text-[#5a5a5a] leading-relaxed">
                  <span className="font-semibold text-[#2d2d2d]">{t('dynamics.daisyNotices')}</span>{' '}
                  {loadingInsights ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#5ba3c6] border-t-transparent rounded-full animate-spin align-middle ml-1" />
                  ) : (
                    insightText
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href={`/${locale}/chat`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#5ba3c6] to-[#4a8fb3] hover:from-[#4a8fb3] hover:to-[#3d7a9e] text-white font-medium text-[15px] shadow-[0_4px_14px_rgba(91,163,198,0.35)] hover:shadow-[0_6px_20px_rgba(91,163,198,0.4)] transition-all"
        >
          {t('dynamics.talkToDaisy')}
        </Link>
      </div>
    </section>
  )
}
