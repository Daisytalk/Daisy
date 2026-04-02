'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Snapshot {
  ESI: number
  BSI: number
  SSI: number
  PVI: number
  MRI: number
}

interface RecommendedProgramsProps {
  snapshot: Snapshot | null
  isPremium: boolean
  locale: string
}

const PROGRAMS: {
  id: 'resource' | 'burnout' | 'support' | 'emotion'
  condition: (s: Snapshot) => boolean
  itemCount: number
}[] = [
  {
    id: 'resource',
    condition: (s: Snapshot) => s.BSI >= 65 && s.MRI <= 40,
    itemCount: 2,
  },
  {
    id: 'burnout',
    condition: (s: Snapshot) => s.BSI >= 65,
    itemCount: 3,
  },
  {
    id: 'support',
    condition: (s: Snapshot) => s.SSI <= 40,
    itemCount: 2,
  },
  {
    id: 'emotion',
    condition: (s: Snapshot) => s.ESI <= 40,
    itemCount: 3,
  },
]

export function RecommendedPrograms({ snapshot, isPremium, locale }: RecommendedProgramsProps) {
  const t = useTranslations('profile')
  if (!snapshot) return null

  const matched = PROGRAMS.filter((p) => p.condition(snapshot)).slice(0, 2)

  if (matched.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
        {t('programs.title')}
      </h2>
      <div className="space-y-4">
        {matched.map((prog) => (
          <div
            key={prog.id}
            className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e8e8e8] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <div className="p-6">
              <span className="text-[11px] font-semibold text-[#5ba3c6] bg-[#e0f7fa] px-3 py-1.5 rounded-lg">
                {t('programs.badge')}
              </span>
              <h3 className="text-[17px] font-semibold text-[#2d2d2d] mt-4">{t(`programs.cards.${prog.id}.title`)}</h3>
              <ul className="mt-4 text-[15px] text-[#6b6b6b] space-y-2.5">
                {Array.from({ length: prog.itemCount }, (_, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6]/70 shrink-0" />
                    {t(`programs.cards.${prog.id}.item${i}`)}
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <Link
                  href={`/${locale}/chat`}
                  className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#5ba3c6] text-white font-medium text-[15px] hover:bg-[#4a8fb3] transition-colors shadow-sm"
                >
                  {t('programs.startProgram')}
                </Link>
              ) : (
                <div className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#f5f5f5] text-[#8e8e8e] font-medium text-[15px] cursor-not-allowed">
                  <Lock className="w-4 h-4 mr-2" />
                  {t('programs.premiumLock')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
