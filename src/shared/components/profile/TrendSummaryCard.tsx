'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { getTrend, getTrendLabel } from '@/shared/lib/scoring-helpers'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

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

const METRICS = [
  { key: 'emotion' as const, label: 'Эмоциональное состояние' },
  { key: 'stress' as const, label: 'Уровень стресса' },
  { key: 'energy' as const, label: 'Энергия' },
  { key: 'support' as const, label: 'Уровень поддержки' },
]

export function TrendSummaryCard({ history, onDetailsClick, locale }: TrendSummaryCardProps) {
  const history7d = history.slice(-7)

  if (history7d.length === 0) {
    return (
      <section>
      <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
        📈 Моя динамика — За последние 7 дней
      </h2>
      <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
        <p className="text-[15px] text-[#6b6b6b] mb-6">
          Пройди первый чек-ин, чтобы увидеть свою динамику 🤍
        </p>
        <Link
          href={`/${locale}/chat`}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#e0f7fa] text-[#5ba3c6] font-medium hover:bg-[#b2ebf2] transition-colors text-[15px]"
        >
          → Начать чек-ин
        </Link>
      </div>
    </section>
  )
}

  const toChartData = (records: HistoryRecord[], key: 'emotion' | 'stress' | 'energy' | 'support') => {
    return records.map((r) => {
      const val = r[key]
      return { day: format(r.date, 'EEE', { locale: ru }), value: val ?? 3 }
    })
  }

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
        📈 Моя динамика — За последние 7 дней
      </h2>
      <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-[#f0f0f0]">
        {METRICS.map((m) => {
          const data = toChartData(history7d, m.key)
          const values = data.map((d) => d.value)
          const trend = getTrend(values)
          const trendLabel = getTrendLabel(m.key, trend)
          return (
            <div key={m.key} className="px-6 py-5">
              <p className="text-[14px] font-medium text-[#6b6b6b] mb-3">{m.label}</p>
              <div className="flex items-center gap-4">
                <div className="w-32 h-10 shrink-0">
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={data}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#5ba3c6"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-[14px] font-medium text-[#4a4a4a]">{trendLabel}</span>
              </div>
            </div>
          )
        })}
        <div className="px-6 py-5 flex justify-center">
          <button
            onClick={onDetailsClick}
            className="inline-flex items-center text-[15px] text-[#5ba3c6] hover:text-[#4a8fb3] transition-colors"
          >
            <span className="border-b border-[#5ba3c6]/30 hover:border-[#4a8fb3]">→ Подробнее</span>
          </button>
        </div>
      </div>
    </section>
  )
}
