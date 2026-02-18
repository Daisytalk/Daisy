'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'

interface CTASectionProps {
  onGetStarted?: () => void
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const t = useTranslations('hero')
  const locale = useLocale()

  const pills = locale === 'ru'
    ? ['24/7 поддержка', 'Без осуждения', 'Конфиденциально', 'На основе науки']
    : ['24/7 support', 'Non-judgmental', 'Confidential', 'Evidence-based']

  const subtitle = locale === 'ru'
    ? 'Присоединяйтесь к тысячам тех, кто уже нашёл поддержку с Daisy'
    : 'Join thousands who have already found support with Daisy'

  return (
    <div className="bg-[#A8C5DA]/25">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
        {/* Daisy logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 shadow-md">
            <Image src="/images/daisy-icon.svg" alt="Daisy" width={52} height={52} className="object-contain" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight"
        >
          {t('title')}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {subtitle}
        </motion.p>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {pills.map((pill) => (
            <span
              key={pill}
              className="px-4 py-1.5 rounded-full bg-[#A8C5DA]/20 text-[#4a7a9b] text-sm font-medium ring-1 ring-[#7E9EC4]/30"
            >
              {pill}
            </span>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-full bg-[#FFDC61] px-8 py-4 text-base sm:text-lg font-semibold text-black shadow-xl hover:bg-yellow-300 active:scale-95 transition-all duration-200"
          >
            {t('talkToDaisy')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
