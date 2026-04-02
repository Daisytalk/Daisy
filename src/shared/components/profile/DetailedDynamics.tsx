'use client'

import { useState, useMemo, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { getBestAndWorstDayForMetric, normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
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
  emotion: { gradient: 'from-rose-400/30 to-pink-300/10', stroke: '#f43f5e', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  stress: { gradient: 'from-amber-400/30 to-orange-300/10', stroke: '#f59e0b', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  energy: { gradient: 'from-emerald-400/30 to-teal-300/10', stroke: '#10b981', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  support: { gradient: 'from-sky-400/30 to-blue-300/10', stroke: '#0ea5e9', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
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
    fetch(`/api/account/dynamics-insights?period=${period}`, { credentials: 'include' })
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
    const cutoff = subDays(new Date(), days)
    return history.filter((r) => new Date(r.date) >= cutoff)
  }, [history, period])

  const dateLocale = locale === 'ru' ? ru : enUS

  const toChartData = (records: HistoryRecord[], key: 'emotion' | 'stress' | 'energy' | 'support') => {
    return records.map((r) => ({
      day: format(r.date, 'EEE', { locale: dateLocale }),
      value: normalizeScoreTo100(r[key]),
    }))
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
            className="rounded-2xl overflow-hidden bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#eee] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-shadow"
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
              <div className="h-36 mb-5 rounded-xl bg-[#fafafa] border border-[#f0f0f0] overflow-hidden">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={theme.stroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={theme.stroke}
                        strokeWidth={2.5}
                        fill={`url(#grad-${m.key})`}
                        dot={{ fill: theme.stroke, strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, fill: theme.stroke, stroke: 'white', strokeWidth: 2 }}
                      />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8e8e8e' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8e8e8e' }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          fontSize: '13px',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                          padding: '10px 14px',
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#b0b0b0] px-4 text-center">
                    <p className="text-[13px] font-medium mb-1">{t('dynamics.emptyChartTitle')}</p>
                    <p className="text-[12px]">{t('dynamics.emptyChartHint')}</p>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#f8f8f8] to-[#f5f5f5] p-4 border border-[#eee]">
                <p className="text-[14px] text-[#4a4a4a] mb-2">
                  <span className="font-medium text-[#2d2d2d]">{t('dynamics.bestDay')}</span> {best} 🌤
                  <span className="mx-2 text-[#ddd]">|</span>
                  <span className="font-medium text-[#2d2d2d]">{t('dynamics.worstDay')}</span> {worst} 🌧
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
