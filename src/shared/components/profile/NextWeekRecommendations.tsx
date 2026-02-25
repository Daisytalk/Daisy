'use client'

import { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Snapshot {
  ESI: number
  BSI: number
  SSI: number
  PVI: number
  MRI: number
}

interface HistoryRecord {
  emotion: number | null
  stress: number | null
  energy: number | null
  support: number | null
}

interface NextWeekRecommendationsProps {
  snapshot: Snapshot | null
  history: HistoryRecord[]
  isPremium: boolean
  aiRecommendations?: string[]
}

const RECOMMENDATIONS: Record<string, string[]> = {
  stress: [
    'Попробуй технику STOP: остановись, сделай вдох, наблюдай',
    'Сократи задачи в To-Do до 3 самых важных',
    'Каждый вечер: 5 минут без телефона',
  ],
  emotion: [
    'Утром: записать одну мысль которая беспокоит',
    'Техника заземления: 5 вещей вокруг тебя',
    'Поговори с Daisy если стало тяжело',
  ],
  energy: [
    'Ложиться спать до 23:00 хотя бы 3 дня',
    'Добавить 15 минут прогулки',
    'Один час без задач — только для себя',
  ],
  support: [
    'Написать кому-то близкому первой',
    'Попробовать попросить о помощи в малом',
    'Запланировать встречу с другом',
  ],
}

export function NextWeekRecommendations({ snapshot, history, isPremium, aiRecommendations }: NextWeekRecommendationsProps) {
  const t = useTranslations('profile')
  const { recs } = useMemo(() => {
    if (aiRecommendations?.length) {
      return { recs: aiRecommendations.slice(0, 3) }
    }
    const metrics = [
      { key: 'stress' as const, avg: history.length ? history.reduce((a, r) => a + (r.stress ?? 3), 0) / history.length : snapshot?.BSI ?? 50 },
      { key: 'emotion' as const, avg: history.length ? history.reduce((a, r) => a + (r.emotion ?? 3), 0) / history.length : snapshot?.ESI ?? 50 },
      { key: 'energy' as const, avg: history.length ? history.reduce((a, r) => a + (r.energy ?? 3), 0) / history.length : 50 },
      { key: 'support' as const, avg: history.length ? history.reduce((a, r) => a + (r.support ?? 3), 0) / history.length : snapshot?.SSI ?? 50 },
    ]
    const sorted = [...metrics].sort((a, b) => a.avg - b.avg)
    const top3 = sorted.slice(0, 3).map((m) => m.key)
    const fallbackRecs: string[] = []
    top3.forEach((k) => {
      RECOMMENDATIONS[k].forEach((r) => fallbackRecs.push(r))
    })
    return { recs: fallbackRecs.slice(0, 3) }
  }, [snapshot, history, aiRecommendations])

  if (recs.length === 0) return null

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
        {t('recommendations.title')}
      </h2>
      <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8">
        <div className={`${!isPremium ? 'relative' : ''}`}>
          {!isPremium && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[24px]">
              <div className="text-center">
                <Lock className="w-8 h-8 mx-auto text-[#8e8e8e] mb-3" />
                <p className="text-[15px] font-medium text-[#4a4a4a]">{t('recommendations.premiumLock')}</p>
              </div>
            </div>
          )}
          <ol className="space-y-4 text-[16px] text-[#2d2d2d]">
            {recs.map((r, i) => (
              <li key={i} className={`flex gap-4 leading-relaxed ${i > 0 && !isPremium ? 'blur-[4px] select-none' : ''}`}>
                <span className="font-semibold text-[#5ba3c6]">{i + 1}.</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
