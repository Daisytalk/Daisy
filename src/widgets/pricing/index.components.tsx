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
      'Access to self-help resources',
      'Mobile app access',
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
    description: 'Most popular plan with enhanced features',
    features: [
      'Everything in 1 Month',
      'Bi-weekly 45-minute live sessions',
      'Priority therapist matching',
      'Crisis support access',
      'Progress tracking & insights',
      'Couples therapy add-on available'
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
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Affordable, transparent pricing for quality mental health care
          </p>
          
          <div className="inline-flex items-center bg-emerald-50 rounded-full p-1 mb-8">
            <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Weekly Plans
            </div>
            <div className="px-4 py-2 text-gray-600 text-sm font-medium">
              Monthly Plans (Save 15%)
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-emerald-500 scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg text-gray-500 line-through">${plan.originalPrice}</span>
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full mb-8 ${
                    plan.popular 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectPlan?.(plan.name)}
                >
                  {plan.cta}
                </Button>
                
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is my information secure?</h4>
              <p className="text-gray-600">Yes, we use bank-level encryption and are HIPAA compliant to ensure your privacy and security.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Absolutely! You can upgrade, downgrade, or cancel your plan at any time with no penalties.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Are the therapists licensed?</h4>
              <p className="text-gray-600">Yes, all our therapists are licensed professionals with extensive experience in mental health care.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What if I need crisis support?</h4>
              <p className="text-gray-600">We provide 24/7 crisis support and emergency resources for all our users when they need immediate help.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}