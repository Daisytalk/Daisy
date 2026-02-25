'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Flame, Heart, Users, Leaf } from 'lucide-react'
import {
  getStressStatus,
  getEmotionStatus,
  getSupportStatus,
  getResourceStatus,
  generateProfileSummary,
} from '@/shared/lib/scoring-helpers'

interface Snapshot {
  ESI: number
  BSI: number
  SSI: number
  PVI: number
  MRI: number
  riskLevel: string
}

interface ProfileStatusCardProps {
  snapshot: Snapshot | null
  locale: string
}

const ITEMS = [
  { key: 'stress' as const, label: 'Уровень стресса', icon: Flame, getStatus: getStressStatus, valueKey: 'BSI' as const },
  { key: 'emotion' as const, label: 'Эмоции', icon: Heart, getStatus: getEmotionStatus, valueKey: 'ESI' as const },
  { key: 'support' as const, label: 'Поддержка', icon: Users, getStatus: getSupportStatus, valueKey: 'SSI' as const },
  { key: 'resource' as const, label: 'Ресурс', icon: Leaf, getStatus: getResourceStatus, valueKey: 'MRI' as const },
]

export function ProfileStatusCard({ snapshot, locale }: ProfileStatusCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (!snapshot) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Мой профиль сейчас
        </h2>
        <div className="rounded-[12px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Пройди онбординг, чтобы увидеть свой эмоциональный профиль 🤍
          </p>
          <a
            href={`/${locale}/onboarding`}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors text-sm"
          >
            Пройти онбординг
          </a>
        </div>
      </section>
    )
  }

  const summary = generateProfileSummary(snapshot.BSI, snapshot.ESI, snapshot.MRI)

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
        Мой профиль сейчас
      </h2>
      <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-[#f0f0f0]">
        {ITEMS.map((item) => {
          const status = item.getStatus(snapshot[item.valueKey])
          const Icon = item.icon
          return (
            <div key={item.key} className="flex items-center gap-4 px-6 py-5">
              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${status.bg}`}>
                <Icon className={`w-5 h-5 ${status.tailwind}`} />
              </div>
              <span className="flex-1 text-[16px] font-medium text-[#2d2d2d]">{item.label}</span>
              <span className={`text-[15px] font-semibold ${status.tailwind}`}>{status.label}</span>
            </div>
          )
        })}
        <div className="px-6 py-5">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-[15px] text-[#5ba3c6] hover:text-[#4a8fb3] transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            Объяснить мой профиль
          </button>
          {expanded && (
            <div className="mt-4 p-5 rounded-[16px] bg-[#f7f7f7] text-[15px] text-[#4a4a4a] leading-relaxed">
              <p className="font-semibold text-[#2d2d2d] mb-2">Daisy замечает:</p>
              <p>{summary}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-5 flex justify-center">
          <Link
            href={`/${locale}/chat`}
            className="inline-flex items-center text-[15px] text-[#5ba3c6] hover:text-[#4a8fb3] transition-colors"
          >
            <span className="border-b border-[#5ba3c6]/30 hover:border-[#4a8fb3]">→ Поговорить с Daisy об этом</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
