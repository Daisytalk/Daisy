'use client'

import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { Button } from '@/shared/ui'

const plans = [
  {
    name: '1 Month',
    price: 15,
    period: 'per month',
    description: 'Perfect for getting started with mental health support',
    features: [
      'Unlimited messaging with your therapist',
      'Weekly 30-minute live sessions',
      'Secure & private platform'
    ],
    popular: false,
    cta: 'Start 1 Month Plan',
    savings: null
  },
  {
    name: '3 Months',
    price: 40,
    period: 'for 3 months',
    originalPrice: 45,
    description: 'Most popular plan',
    features: [
      'Everything in 1 Month',
      'Bi-weekly 45-minute live sessions',
      'Progress tracking & insights',
    ],
    popular: true,
    cta: 'Start 3 Month Plan',
    savings: 'Save $5'
  },
  {
    name: '6 Months',
    price: 75,
    period: 'for 6 months',
    originalPrice: 90,
    description: 'Comprehensive support with maximum value',
    features: [
      'Everything in 3 Months',
      'Weekly 60-minute live sessions',
      'Same-day session availability',
      '24/7 crisis intervention',
      'Psychiatric consultation',
      'Family therapy sessions',
      'Personalized treatment plans'
    ],
    popular: false,
    cta: 'Start 6 Month Plan',
    savings: '1 month for free'
  }
]

interface PricingSectionProps {
  onSelectPlan?: (planName: string) => void
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Affordable, transparent pricing for quality mental health care
          </p>
          
          <div className="inline-flex items-center bg-emerald-50 rounded-full p-1 mb-6 sm:mb-8">
            <div className="bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              Weekly Plans
            </div>
            <div className="px-3 sm:px-4 py-2 text-gray-600 text-xs sm:text-sm font-medium">
              Monthly Plans (Save 15%)
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-emerald-500 lg:scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-sm sm:text-base text-gray-600">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base sm:text-lg text-gray-500 line-through">${plan.originalPrice}</span>
                      <span className="text-xs sm:text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full mb-6 sm:mb-8 py-3 text-sm sm:text-base ${
                    plan.popular 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectPlan?.(plan.name)}
                >
                  {plan.cta}
                </Button>
                
                <ul className="space-y-3 sm:space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}