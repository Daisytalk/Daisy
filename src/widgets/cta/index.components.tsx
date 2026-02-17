'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface CTASectionProps {
  onGetStarted?: () => void
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const t = useTranslations('hero')
  
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-center lg:px-8">
        <div 
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div 
            className="relative left-1/2 -z-10 aspect-[1155/678] w-[72.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#7E9EC4] to-[#A8C5DA] opacity-50"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }} 
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl whitespace-pre-line">
            {t('title')}
          </h2>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={onGetStarted}
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-black shadow-lg ring-1 ring-gray-200 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              {t('talkToDaisy')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}