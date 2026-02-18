'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function NeuroplasticitySection() {
  const t = useTranslations('neuroplasticity')

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-8xl px-6 lg:px-8">

        <div className="relative isolate overflow-hidden px-6 min-h-[480px] sm:h-[600px] py-10 sm:py-16 shadow-2xl rounded-3xl sm:px-16">
          <div className="absolute inset-0">
            <video
              src="videos/main.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover">
            </video>
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-xl h-full flex flex-col justify-between text-left"
          >
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/80 drop-shadow">
              {t('subtitle')}
            </p>
            <div>
              <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-md whitespace-pre-line">
                {t('title')}
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-6 sm:leading-8 text-white/90 drop-shadow whitespace-pre-line">
                {t('description')}
              </p>
              <div className="mt-8 sm:mt-10">
                <a
                  href="#"
                  className="inline-block rounded-full bg-[#FFDC61] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-black shadow-md hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  {t('talkToDaisy')}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}