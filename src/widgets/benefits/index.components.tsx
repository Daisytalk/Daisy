'use client'

import { motion } from 'framer-motion'
import { CirclePlus } from 'lucide-react'

const benefits = [
  {
    name: 'Any minute, anywhere',
    description: 'Tap to talk-at home, on the way, or between meetings.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=210&h=126&fit=crop&crop=center',
  },
  {
    name: 'Designed with psychologists',
    description: 'And grounded in modern methods (CBT, DBT, gentle activation).',
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=210&h=126&fit=crop&crop=center',
  },
  {
    name: 'Daisy keeps context over time',
    description: 'so you never start from scratch.',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=210&h=126&fit=crop&crop=center',
  },
]

export function BenefitsSection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-8xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:pr-4"
          >
            <div className="text-4xl tracking-tight text-gray-900 sm:text-4xl space-y-6">
              <p className="leading-snug font-semibold">Can't wait weeks for therapy?</p>
              <p className="leading-snug font-base"> You still deserve relief. Daisy listens without judgment and offers gentle, psychology-informed steps you can take today.</p>
              <p className="leading-snug font-semibold">A new standard for everyday mental support: <span className="font-normal">quick, private, always-on.</span></p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-4">
              <a href="#how-it-works" className="rounded-full px-6 py-3 text-lg font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-50 transition-colors">
                How Daisy Works
              </a>
              <a href="#about" className="flex items-center gap-x-2 text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors">
                <CirclePlus className="h-6 w-6" />
                Privacy & Ethics
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
                  className={`relative p-8 ${index < benefits.length - 1 ? 'border-b border-gray-300' : ''}`}
                >
                  <div className="flex items-center gap-x-8">
                    <img
                      className="h-24 w-40 flex-shrink-0 rounded-lg object-cover"
                      src={benefit.imageUrl}
                      alt={benefit.name}
                    />
                    <div className="flex-1">
                      <dt className="text-2xl font-semibold leading-7 text-gray-900">{benefit.name}</dt>
                      <dd className="mt-1 text-xl leading-7 text-gray-700">{benefit.description}</dd>
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