'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui'

/** Идентификаторы планов, используемые для создания платежей через Freedom Pay */
export type PlanId = 'month_1' | 'month_3' | 'month_6'

export interface PlanInfo {
  id: PlanId
  name: string
  nameBold?: string
  nameItalic?: string
  priceDisplay?: string
  price: number
  /** Длительность в месяцах */
  durationMonths: number
  originalPrice?: number
  description: string
  features: string[]
  popular: boolean
  cta: string
  savings: string | null
  period: string
}

interface PricingSectionProps {
  onSelectPlan?: (plan: PlanInfo) => void
}

const DAISY_TEAL = '#5ba3c6'
const DAISY_TEAL_SOFT = 'rgba(91,163,198,0.08)'

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const t = useTranslations('pricing')

  const plans: PlanInfo[] = [
    {
      id: 'month_1',
      name: t('plan1Name'),
      nameBold: t('plan1NameBold'),
      nameItalic: t('plan1NameItalic'),
      priceDisplay: t('plan1Price'),
      price: 7500,
      durationMonths: 1,
      period: t('perMonth'),
      description: t('plan1Desc'),
      features: [t('feature1'), t('feature3')],
      popular: false,
      cta: t('plan1Cta'),
      savings: null
    },
    {
      id: 'month_3',
      name: t('plan2Name'),
      nameBold: t('plan2NameBold'),
      nameItalic: t('plan2NameItalic'),
      priceDisplay: t('plan2Price'),
      price: 20000,
      durationMonths: 3,
      period: t('for3Months'),
      originalPrice: 22500,
      description: t('plan2Desc'),
      features: [t('feature4'), t('feature5'), t('feature6')],
      popular: true,
      cta: t('plan2Cta'),
      savings: `${t('save')} 2 500 ₸`
    },
    {
      id: 'month_6',
      name: t('plan3Name'),
      nameBold: t('plan3NameBold'),
      nameItalic: t('plan3NameItalic'),
      priceDisplay: t('plan3Price'),
      price: 40000,
      durationMonths: 6,
      period: t('for6Months'),
      originalPrice: 45000,
      description: t('plan3Desc'),
      features: [t('feature7'), t('feature8'), t('feature9'), t('feature10')],
      popular: false,
      cta: t('plan3Cta'),
      savings: t('oneMonthFree')
    }
  ]

  return (
    <section
      id="pricing"
      className="relative flex-1 flex flex-col items-center justify-center py-4 sm:py-6 overflow-hidden scroll-mt-20 min-h-0"
      style={{ background: '#fafbfc' }}
    >
      <div className="relative flex flex-col items-center max-w-5xl w-full px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-4 sm:mb-5 shrink-0"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-[#2d3748] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-[13px] text-[#718096] mt-1 max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 flex-1 min-h-0 content-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`relative flex flex-col rounded-xl overflow-hidden transition-shadow duration-200 ${
                plan.popular ? 'ring-2 ring-[#5ba3c6]/40' : ''
              }`}
              style={{
                background: '#ffffff',
                border: '1px solid #e8ecf0',
                boxShadow: plan.popular ? '0 4px 20px rgba(91,163,198,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {plan.popular && (
                <div
                  className="absolute top-0 left-0 right-0 py-1.5 flex items-center justify-center"
                  style={{ background: DAISY_TEAL_SOFT }}
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: DAISY_TEAL }}>
                    {t('mostPopular')}
                  </span>
                </div>
              )}

              <div className={`flex flex-col flex-1 p-4 ${plan.popular ? 'pt-10' : ''}`}>
                <div className="mb-2">
                  <p className="text-base font-semibold text-[#2d3748]">{plan.nameBold ?? plan.name}</p>
                  {plan.nameItalic && (
                    <p className="text-[12px] text-[#718096] mt-0.5">{plan.nameItalic}</p>
                  )}
                </div>

                <p className="text-[12px] text-[#718096] leading-snug mb-3">{plan.description}</p>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#2d3748]">
                      {plan.priceDisplay ?? `${plan.price.toLocaleString('ru-KZ')} ₸`}
                    </span>
                    <span className="text-[12px] text-[#718096]">{plan.period}</span>
                  </div>
                  {plan.originalPrice != null && plan.savings && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[12px] text-[#a0aec0] line-through">
                        {plan.originalPrice.toLocaleString('ru-KZ')} ₸
                      </span>
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                        style={{ color: DAISY_TEAL, background: DAISY_TEAL_SOFT }}
                      >
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90 mb-3 ${
                    plan.popular ? 'text-white' : 'bg-[#2d3748] text-white'
                  }`}
                  style={plan.popular ? { backgroundColor: DAISY_TEAL } : undefined}
                  onClick={() => onSelectPlan?.(plan)}
                >
                  {plan.cta}
                </Button>

                {plan.features.length > 0 && (
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: DAISY_TEAL }} strokeWidth={2} />
                        <span className="text-[12px] text-[#4a5568] leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}