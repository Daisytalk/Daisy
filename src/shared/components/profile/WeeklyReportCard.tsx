'use client'

import { useMemo, useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getWeeklyDelta } from '@/shared/lib/scoring-helpers'

type Period = '7d' | '14d' | '30d'

interface HistoryRecord {
  id: string
  date: Date
  emotion: number | null
  stress: number | null
  energy: number | null
  support: number | null
}

interface WeeklyReportCardProps {
  history: HistoryRecord[]
  memoryTopics: string[]
  isPremium: boolean
  locale?: string
}

export function WeeklyReportCard({ history, memoryTopics, isPremium, locale = 'ru' }: WeeklyReportCardProps) {
  const [period, setPeriod] = useState<Period>('7d')
  const [aiReport, setAiReport] = useState<{ summary: string; recommendations: string[] } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPremium) return
    setLoading(true)
    fetch(`/api/account/weekly-report?period=${period}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.summary) setAiReport({ summary: d.summary, recommendations: d.recommendations ?? [] })
      })
      .catch(() => setAiReport(null))
      .finally(() => setLoading(false))
  }, [period, isPremium])
  const daysForPeriod = period === '7d' ? 7 : period === '14d' ? 14 : 30
  const weekData = useMemo(() => {
    const week = history.filter((r) => new Date(r.date) >= subDays(new Date(), daysForPeriod))
    const byDay = week.reduce((acc, r) => {
      const d = format(r.date, 'yyyy-MM-dd')
      if (!acc[d]) acc[d] = { date: d, emotion: 0, stress: 0, energy: 0, support: 0, count: 0 }
      acc[d].emotion += r.emotion ?? 3
      acc[d].stress += r.stress ?? 3
      acc[d].energy += r.energy ?? 3
      acc[d].support += r.support ?? 3
      acc[d].count += 1
      return acc
    }, {} as Record<string, { date: string; emotion: number; stress: number; energy: number; support: number; count: number }>)
    return Object.values(byDay).map((v) => ({
      day: format(new Date(v.date), 'EEE', { locale: ru }),
      emotion: v.count ? v.emotion / v.count : 3,
      stress: v.count ? v.stress / v.count : 3,
      energy: v.count ? v.energy / v.count : 3,
      support: v.count ? v.support / v.count : 3,
    }))
  }, [history, daysForPeriod])

  const prevWeek = useMemo(() => {
    const prev = history.filter(
      (r) =>
        new Date(r.date) >= subDays(new Date(), 14) &&
        new Date(r.date) < subDays(new Date(), 7)
    )
    const avg = (key: 'emotion' | 'stress' | 'energy' | 'support') => {
      if (!prev.length) return 50
      const sum = prev.reduce((a, r) => a + (r[key] ?? 3) * 20, 0)
      return sum / prev.length
    }
    return { emotion: avg('emotion'), stress: avg('stress'), energy: avg('energy'), support: avg('support') }
  }, [history])

  const currWeek = useMemo(() => {
    const curr = history.filter((r) => new Date(r.date) >= subDays(new Date(), 7))
    if (!curr.length) return { emotion: 50, stress: 50, energy: 50, support: 50 }
    const avg = (key: 'emotion' | 'stress' | 'energy' | 'support') => {
      const sum = curr.reduce((a, r) => a + (r[key] ?? 3) * 20, 0)
      return sum / curr.length
    }
    return { emotion: avg('emotion'), stress: avg('stress'), energy: avg('energy'), support: avg('support') }
  }, [history])

  const deltas = [
    { metric: 'Стресс', ...getWeeklyDelta(currWeek.stress, prevWeek.stress) },
    { metric: 'Энергия', ...getWeeklyDelta(currWeek.energy, prevWeek.energy) },
    { metric: 'Поддержка', ...getWeeklyDelta(currWeek.support, prevWeek.support) },
    { metric: 'Эмоции', ...getWeeklyDelta(currWeek.emotion, prevWeek.emotion) },
  ]

  const fallbackSummary =
    currWeek.stress >= 60
      ? 'Эта неделя была непростой — стресс держался на высоком уровне.'
      : currWeek.energy <= 40
        ? 'Энергия была на исходе. Важно восстановиться.'
        : 'Неделя прошла относительно стабильно 🤍'

  const summary = aiReport?.summary || fallbackSummary
  const recommendations = aiReport?.recommendations?.length
    ? aiReport.recommendations
    : ['Попробуй технику STOP при стрессе', 'Добавь 15 минут прогулки', 'Поговори с Daisy если станет тяжело']

  return (
    <section className="space-y-8">
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

      <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-8 border-b border-[#f0f0f0]">
          <h3 className="text-[18px] font-semibold text-[#2d2d2d] mb-4">Твоя неделя</h3>
          {loading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#5ba3c6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-[15px] text-[#4a4a4a] leading-relaxed">{aiReport?.summary || fallbackSummary}</p>
          )}
        </div>

        {memoryTopics.length > 0 && (
          <div className="p-8 border-b border-[#f0f0f0] bg-[#fafafa]">
            <h3 className="text-[15px] font-medium text-[#6b6b6b] mb-4">О чём была неделя:</h3>
            <div className="flex flex-wrap gap-2">
              {memoryTopics.slice(0, 5).map((t, i) => (
                <span key={i} className="px-3 py-1.5 rounded-[12px] bg-white text-[#4a4a4a] text-[14px] shadow-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-8 border-b border-[#f0f0f0]">
          <h3 className="text-[15px] font-medium text-[#6b6b6b] mb-5">Изменения за неделю:</h3>
          <div className="grid grid-cols-2 gap-4">
            {deltas.map((d) => (
              <div key={d.metric} className="p-4 rounded-[16px] bg-[#f7f7f7]">
                <p className="text-[13px] text-[#8e8e8e] mb-1">{d.metric}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[15px] font-medium ${d.tailwind}`}>{d.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-b border-[#f0f0f0]">
          <h3 className="text-[15px] font-medium text-[#6b6b6b] mb-5">График недели:</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="emotion" name="Эмоции" stroke="#5ba3c6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="stress" name="Стресс" stroke="#e57373" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-[15px] font-medium text-[#6b6b6b] mb-5">Рекомендации из отчёта:</h3>
          <div className={`${!isPremium ? 'relative' : ''}`}>
            {!isPremium && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[16px]">
                <div className="text-center">
                  <Lock className="w-8 h-8 mx-auto text-[#8e8e8e] mb-3" />
                  <p className="text-[15px] font-medium text-[#4a4a4a] mb-4">Полный отчёт доступен в Premium</p>
                  <Link
                    href={`/${locale}/pricing`}
                    className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#5ba3c6] text-white text-[14px] font-medium hover:bg-[#4a8fb3] transition-colors"
                  >
                    Обновить план
                  </Link>
                </div>
              </div>
            )}
            <ul className="space-y-4">
              {(aiReport?.recommendations || fallbackRecommendations).map((r, i) => (
                <li key={i} className={`flex gap-4 leading-relaxed text-[15px] text-[#2d2d2d] ${i > 0 && !isPremium ? 'blur-[4px] select-none' : ''}`}>
                  <span className="font-semibold text-[#5ba3c6]">·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
