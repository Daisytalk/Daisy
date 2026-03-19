'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
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

export function ProfileStatusCard({ snapshot, locale }: ProfileStatusCardProps) {
  const t = useTranslations('profile')
  const [expanded, setExpanded] = useState(false)

  const ITEMS = [
    { key: 'stress' as const, label: t('status.metrics.stress'), icon: Flame, getStatus: getStressStatus, valueKey: 'BSI' as const },
    { key: 'emotion' as const, label: t('status.metrics.emotion'), icon: Heart, getStatus: getEmotionStatus, valueKey: 'ESI' as const },
    { key: 'support' as const, label: t('status.metrics.support'), icon: Users, getStatus: getSupportStatus, valueKey: 'SSI' as const },
    { key: 'resource' as const, label: t('status.metrics.resource'), icon: Leaf, getStatus: getResourceStatus, valueKey: 'MRI' as const },
  ]

  if (!snapshot) {
    return (
      <section>
        <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
          {t('status.title')}
        </h2>
        <div className="rounded-2xl bg-white border border-[#eee] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f8f8f8] mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-[15px] text-[#6b6b6b] mb-6">
            {t('status.noData')}
          </p>
          <a
            href={`/${locale}/onboarding`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-[#5ba3c6] to-[#4a8fb3] text-white font-medium hover:from-[#4a8fb3] hover:to-[#3d7a9e] transition-all text-[15px] shadow-[0_4px_14px_rgba(91,163,198,0.3)]"
          >
            {t('status.startOnboarding')}
          </a>
        </div>
      </section>
    )
  }

  const summary = generateProfileSummary(snapshot.BSI, snapshot.ESI, snapshot.MRI)

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
        {t('status.title')}
      </h2>
      <div className="rounded-2xl bg-white border border-[#eee] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
        <div className="grid grid-cols-2 gap-3 p-4">
          {ITEMS.map((item) => {
            const status = item.getStatus(snapshot[item.valueKey])
            const Icon = item.icon
            return (
              <div key={item.key} className="flex items-center gap-3 p-4 rounded-xl bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#f0f0f0] transition-colors">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${status.bg}`}>
                  <Icon className={`w-5 h-5 ${status.tailwind}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-[#6b6b6b] truncate">{item.label}</p>
                  <p className={`text-[15px] font-semibold ${status.tailwind}`}>{status.label}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-6 py-4 border-t border-[#f0f0f0]">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-[14px] text-[#5ba3c6] hover:text-[#4a8fb3] transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {t('status.explainProfile')}
          </button>
          {expanded && (
            <div className="mt-4 p-5 rounded-xl bg-[#f8f8f8] text-[15px] text-[#4a4a4a] leading-relaxed">
              <p className="font-semibold text-[#2d2d2d] mb-2">{t('status.daisyNotices')}</p>
              <p>{summary}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 flex justify-center bg-gradient-to-r from-[#fafafa] to-[#f5f5f5] border-t border-[#f0f0f0]">
          <Link
            href={`/${locale}/chat`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#5ba3c6] to-[#4a8fb3] hover:from-[#4a8fb3] hover:to-[#3d7a9e] text-white font-medium text-[15px] transition-all shadow-[0_4px_14px_rgba(91,163,198,0.25)]"
          >
            {t('status.talkToDaisy')}
          </Link>
        </div>
      </div>
    </section>
  )
}
