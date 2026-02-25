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

const PROGRAMS = [
  {
    condition: (s: Snapshot) => s.BSI >= 65 && s.MRI <= 40,
    title: '🌿 Восстановление ресурса',
    items: ['отдых без вины', 'восполнение энергии'],
    id: 'resource',
  },
  {
    condition: (s: Snapshot) => s.BSI >= 65,
    title: '🔥 Анти-выгорание 14 дней',
    items: ['ежедневные микро-шаги', 'утренний чек-ин', 'вечерняя регуляция'],
    id: 'burnout',
  },
  {
    condition: (s: Snapshot) => s.SSI <= 40,
    title: '🤝 Снижение одиночества',
    items: ['работа с установками', 'безопасные шаги в общении'],
    id: 'support',
  },
  {
    condition: (s: Snapshot) => s.ESI <= 40,
    title: '🌊 Стабилизация эмоций',
    items: ['техники DBT', 'заземление', 'работа с триггерами'],
    id: 'emotion',
  },
]

export function RecommendedPrograms({ snapshot, isPremium, locale }: RecommendedProgramsProps) {
  const t = useTranslations('profile')
  if (!snapshot) return null

  const matched = PROGRAMS.filter((p) => p.condition(snapshot)).slice(0, 2)

  if (matched.length === 0) return null

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
        {t('programs.title')}
      </h2>
      <div className="space-y-4">
        {matched.map((prog) => (
          <div
            key={prog.id}
            className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="p-6">
              <span className="text-[12px] font-medium text-[#5ba3c6] bg-[#e0f7fa] px-3 py-1 rounded-full">
                {t('programs.badge')}
              </span>
              <h3 className="text-[18px] font-semibold text-[#2d2d2d] mt-4">{prog.title}</h3>
              <ul className="mt-4 text-[15px] text-[#6b6b6b] space-y-2">
                {prog.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6] opacity-60" />
                    {item}
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <Link
                  href={`/${locale}/chat`}
                  className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-full bg-[#5ba3c6] text-white font-medium text-[15px] hover:bg-[#4a8fb3] transition-colors"
                >
                  {t('programs.startProgram')}
                </Link>
              ) : (
                <div className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-full bg-[#f5f5f5] text-[#8e8e8e] font-medium text-[15px] cursor-not-allowed">
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
