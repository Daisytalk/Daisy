'use client'

import { useMemo } from 'react'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
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

export function NextWeekRecommendations({ snapshot, history, isPremium, aiRecommendations }: NextWeekRecommendationsProps) {
  const t = useTranslations('profile')
  const { recs } = useMemo(() => {
    if (aiRecommendations?.length) {
      return { recs: aiRecommendations.slice(0, 3) }
    }
    const metrics = [
      {
        key: 'stress' as const,
        avg: history.length
          ? history.reduce((a, r) => a + normalizeScoreTo100(r.stress), 0) / history.length
          : snapshot?.BSI ?? 50,
      },
      {
        key: 'emotion' as const,
        avg: history.length
          ? history.reduce((a, r) => a + normalizeScoreTo100(r.emotion), 0) / history.length
          : snapshot?.ESI ?? 50,
      },
      {
        key: 'energy' as const,
        avg: history.length ? history.reduce((a, r) => a + normalizeScoreTo100(r.energy), 0) / history.length : 50,
      },
      {
        key: 'support' as const,
        avg: history.length
          ? history.reduce((a, r) => a + normalizeScoreTo100(r.support), 0) / history.length
          : snapshot?.SSI ?? 50,
      },
    ]
    const sorted = [...metrics].sort((a, b) => a.avg - b.avg)
    const top3 = sorted.slice(0, 3).map((m) => m.key)
    const fallbackRecs: string[] = []
    top3.forEach((k) => {
      ;(['0', '1', '2'] as const).forEach((i) => {
        fallbackRecs.push(t(`recommendations.fallback.${k}.${i}`))
      })
    })
    return { recs: fallbackRecs.slice(0, 3) }
  }, [snapshot, history, aiRecommendations, t])

  if (recs.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
        {t('recommendations.title')}
      </h2>
      <div className="rounded-2xl bg-white border border-[#eee] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-8 relative overflow-hidden">
        <div className={`${!isPremium ? 'relative' : ''}`}>
          {!isPremium && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
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
