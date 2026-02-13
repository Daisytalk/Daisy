'use client'

import { motion } from 'framer-motion'
import { CirclePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BenefitsSection() {
  const t = useTranslations('benefits')
  
  const benefits = [
    {
      name: t('benefit1Title'),
      description: t('benefit1Desc'),
      imageUrl: '/images/support.JPG',
    },
    {
      name: t('benefit2Title'),
      description: t('benefit2Desc'),
      imageUrl: '/images/proven.JPG',
    },
    {
      name: t('benefit3Title'),
      description: t('benefit3Desc'),
      imageUrl: '/images/available.JPG',
    },
  ]

  return (
    <div className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-12 sm:gap-y-16 lg:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:pr-4"
          >
            <div className="text-xl sm:text-2xl lg:text-3xl tracking-tight text-gray-900 space-y-4 sm:space-y-6">
              <p className="leading-tight font-semibold">{t('title1')}</p>
              <p className="leading-tight font-base text-xl sm:text-2xl lg:text-3xl">{t('title2')}</p>
              <p className="leading-tight font-normal">{t('title3')} <span className="font-semibold">{t('title3Bold')}</span></p>
            </div>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
              <a href="#how-it-works" className="rounded-full px-6 py-3 text-base sm:text-lg font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-50 transition-colors text-center">
                {t('howItWorks')}
              </a>
              <a href="#about" className="flex items-center gap-x-2 text-base sm:text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors">
                <CirclePlus className="h-5 w-5 sm:h-6 sm:w-6" />
                {t('privacyEthics')}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <dl className="space-y-0 border-t border-b border-gray-300">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative p-4 sm:p-6 lg:p-8 ${index < benefits.length - 1 ? 'border-b border-gray-300' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
                    <img
                      className="h-20 w-32 sm:h-24 sm:w-40 flex-shrink-0 rounded-lg object-cover"
                      src={benefit.imageUrl}
                      alt={benefit.name}
                    />
                    <div className="flex-1">
                      <dt className="text-lg sm:text-xl lg:text-2xl font-semibold leading-6 sm:leading-7 text-gray-900">{benefit.name}</dt>
                      <dd className="mt-1 text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-gray-700">{benefit.description}</dd>
                    </div>
                  </div>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </div>
  )
}