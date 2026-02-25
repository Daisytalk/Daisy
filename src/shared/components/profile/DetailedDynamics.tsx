'use client'

import { useState, useMemo, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getBestAndWorstDay } from '@/shared/lib/scoring-helpers'
import { Heart, Flame, Zap, Users } from 'lucide-react'
import Link from 'next/link'

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

const METRICS_CONFIG = [
  { key: 'emotion' as const, label: 'Эмоции', icon: Heart },
  { key: 'stress' as const, label: 'Стресс', icon: Flame },
  { key: 'energy' as const, label: 'Энергия', icon: Zap },
  { key: 'support' as const, label: 'Поддержка', icon: Users },
]

type Period = '7d' | '14d' | '30d'

export function DetailedDynamics({ history, locale }: DetailedDynamicsProps) {
  const [period, setPeriod] = useState<Period>('7d')
  const [insights, setInsights] = useState<{ emotion?: string; stress?: string; energy?: string; support?: string } | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  useEffect(() => {
    setLoadingInsights(true)
    fetch(`/api/account/dynamics-insights?period=${period}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setInsights(d)
      })
      .catch(() => setInsights(null))
      .finally(() => setLoadingInsights(false))
  }, [period])

  const filtered = useMemo(() => {
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
    const cutoff = subDays(new Date(), days)
    return history.filter((r) => new Date(r.date) >= cutoff)
  }, [history, period])

  const toChartData = (records: HistoryRecord[], key: 'emotion' | 'stress' | 'energy' | 'support') => {
    return records.map((r) => ({
      day: format(r.date, 'EEE', { locale: ru }),
      value: (r[key] ?? 3) as number,
    }))
  }

  return (
    <section className="space-y-6">
      <div className="flex gap-2 bg-[#f0f0f0] p-1 rounded-[16px] w-fit">
        {(['7d', '14d', '30d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2.5 rounded-[12px] text-[15px] font-medium transition-all ${
              period === p ? 'bg-white text-[#2d2d2d] shadow-sm' : 'text-[#6b6b6b] hover:text-[#2d2d2d]'
            }`}
          >
            {p === '7d' ? '7 дней' : p === '14d' ? '2 недели' : 'Месяц'}
          </button>
        ))}
      </div>

      {METRICS_CONFIG.map((m) => {
        const data = toChartData(filtered, m.key)
        const { best, worst } = getBestAndWorstDay(data)
        const Icon = m.icon
        const insightText = insights?.[m.key] || 'Анализирую твои данные...'
        
        return (
          <div key={m.key} className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-[14px] bg-[#e0f7fa] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#5ba3c6]" />
              </div>
              <span className="text-[16px] font-semibold text-[#2d2d2d]">{m.label}</span>
            </div>
            <div className="h-40 mb-4">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5ba3c6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#5ba3c6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#5ba3c6"
                    fill={`url(#grad-${m.key})`}
                    strokeWidth={3}
                    dot={false}
                  />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8e8e8e' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#8e8e8e' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      fontSize: '13px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      padding: '12px'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#f7f7f7] rounded-[16px] p-5">
              <p className="text-[14px] text-[#4a4a4a] mb-3">
                <span className="font-medium">Лучший день:</span> {best} 🌤 <span className="mx-2 text-[#e5e5e5]">|</span> <span className="font-medium">Самый тяжёлый:</span> {worst} 🌧
              </p>
              <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                <span className="font-medium text-[#2d2d2d]">Daisy замечает:</span>{' '}
                {loadingInsights ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#5ba3c6] border-t-transparent rounded-full animate-spin align-middle ml-1" />
                ) : (
                  insightText
                )}
              </p>
            </div>
          </div>
        )
      })}

      <div className="flex justify-center pt-4">
        <Link
          href={`/${locale}/chat`}
          className="inline-flex items-center text-[15px] text-[#5ba3c6] hover:text-[#4a8fb3] transition-colors"
        >
          <span className="border-b border-[#5ba3c6]/30 hover:border-[#4a8fb3]">→ Поговорить с Daisy об этом</span>
        </Link>
      </div>
    </section>
  )
}
