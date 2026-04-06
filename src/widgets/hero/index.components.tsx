'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/shared/ui'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { Menu, X, Brain, Bot, Heart } from 'lucide-react'
interface HeroSectionProps {
  onGetStarted?: () => void
  onLearnMore?: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations('hero')
  const locale = useLocale()

  const navigation = [
    { name: t('howItWorks'), href: '#how-it-works' },
    { name: t('whyDaisy'), href: '#about' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('faq'), href: '#faq' },
  ]

  const features = [
    {
      name: t('feature1'),
      icon: Bot,
    },
    {
      name: t('feature2'),
      icon: Brain,
    },
    {
      name: t('feature3'),
      icon: Heart,
    },
  ]

  return (
    <div className="relative isolate min-h-screen">
      {/* Background Image - Mountain landscape */}
      <div className="absolute inset-0 -z-10">
        <video
          src="videos/daisy - starting page.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover">
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-8xl items-center justify-between p-4 sm:p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
          <Link href={`/${locale}`} className="-m-1.5 p-1.5">
            <Image src="/images/logo.svg" className="h-8 sm:h-10 lg:h-12 w-auto" alt="Daisy logo" width={48} height={48} priority />
          </Link>
          </div>
          <div className="flex flex-1 justify-end items-center">
            <div className="hidden lg:flex lg:gap-x-6 xl:gap-x-8 mr-4 xl:mr-6">
              {navigation.map((item) => (
                <Link key={item.name} href={`/${locale}${item.href}`} className="text-sm xl:text-base font-medium leading-6 text-white hover:text-gray-300 transition-colors whitespace-nowrap">
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex lg:items-center lg:mr-4 xl:mr-5">
              <LanguageSwitcher variant="dark" />
            </div>
            <div className="hidden lg:flex lg:justify-end lg:gap-x-2 xl:gap-x-3 lg:items-center">
              <Button
                variant="outline"
                className="text-white border-white bg-transparent rounded-full px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm"
                onClick={() => router.push(`/${locale}/login`)}
              >
                {t('login')}
              </Button>
              <Button
                onClick={onGetStarted}
                className="bg-[#FFDC61] text-black hover:bg-gray-200 rounded-full px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm whitespace-nowrap"
              >
                {t('talkToDaisy')}
              </Button>
            </div>
            <div className="flex lg:hidden items-center gap-2 sm:gap-3">
              <LanguageSwitcher variant="dark" />
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">{t('openMenu')}</span>
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900/95 backdrop-blur-md px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
              <div className="flex items-center justify-between">
                <Link href={`/${locale}`} className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Daisy</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">Daisy</span>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">{t('closeMenu')}</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-8 flow-root">
                <div className="-my-6 divide-y divide-gray-500/25">
                  <div className="space-y-3 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={`/${locale}${item.href}`}
                        className="-mx-3 block rounded-lg px-4 py-3 text-lg font-semibold leading-7 text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6 space-y-4">
                    <Button
                      variant="outline"
                      className="w-full text-black border-white hover:bg-gray-800 py-3 text-base"
                      onClick={() => router.push(`/${locale}/login`)}
                    >
                      {t('login')}
                    </Button>
                    <Button
                      onClick={onGetStarted}
                      className="w-full bg-white text-black hover:bg-gray-200 py-3 text-base"
                    >
                      {t('talkToDaisy')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Content */}
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center items-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16 pt-16 sm:pt-20 lg:pt-0 px-2"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-white leading-tight whitespace-pre-line">
            {t('title')}
          </h1>
        </motion.div>

        <div className="absolute bottom-4 sm:bottom-8 lg:bottom-12 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 sm:gap-6 lg:gap-8 max-w-8xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:max-w-md text-center lg:text-left"
            >
              <p className="text-sm sm:text-base lg:text-lg leading-5 sm:leading-6 lg:leading-7 text-white mb-4 sm:mb-6 whitespace-pre-line">
                {t('subtitle')}
              </p>
              <Button
                onClick={onGetStarted}
                className="rounded-full bg-[#FFDC61] px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold text-black shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white w-full sm:w-auto"
              >
                {t('talkToDaisy')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full lg:w-auto"
            >
              <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3 sm:p-4 ring-1 ring-white/20">
                <div className="flex flex-col sm:flex-row lg:flex-row items-center gap-3 sm:gap-4 lg:gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <div className="text-white">
                        <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" aria-hidden="true" />
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white text-center whitespace-pre-line">{feature.name}</div>
                      {index < features.length - 1 && <div className="hidden sm:block h-6 lg:h-8 w-px bg-white/50"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}