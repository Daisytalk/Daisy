'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ProfilePremiumBannerProps {
  locale: string
}

export function ProfilePremiumBanner({ locale }: ProfilePremiumBannerProps) {
  const t = useTranslations('profile')
  return (
    <section>
      <div className="rounded-[24px] bg-gradient-to-br from-[#e0f7fa] to-[#f0f9ff] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-30">
          <Sparkles className="w-16 h-16 text-[#5ba3c6]" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-[#5ba3c6]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] font-semibold text-[#2d2d2d]">{t('premium.title')}</h3>
            <p className="text-[15px] text-[#6b6b6b] mt-2 leading-relaxed">
              {t('premium.desc')}
            </p>
            <ul className="mt-4 text-[14px] text-[#4a4a4a] space-y-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6]" /> {t('premium.features.guided')}</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6]" /> {t('premium.features.weekly')}</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6]" /> {t('premium.features.techniques')}</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6]" /> {t('premium.features.history')}</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#5ba3c6]" /> {t('premium.features.recs')}</li>
            </ul>
            <Link
              href={`/${locale}/pricing`}
              className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#5ba3c6] text-white font-medium text-[15px] hover:bg-[#4a8fb3] transition-colors shadow-sm"
            >
              {t('premium.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
