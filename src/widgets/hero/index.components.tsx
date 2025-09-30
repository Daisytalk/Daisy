'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui'
import { LanguageSwitcher } from '@/shared/ui/language-switcher'
import { Menu, X, Brain, Bot, Heart } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted?: () => void
  onLearnMore?: () => void
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Why Daisy', href: '#about' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
  ]

  const features = [
    {
      name: 'Personalized AI Companion',
      icon: Bot,
    },
    {
      name: 'Strong Scientific Background',
      icon: Brain,
    },
    {
      name: 'Quick Responses',
      icon: Heart,
    },
  ]

  return (
    <div className="relative isolate min-h-screen">
      {/* Background Image - Mountain landscape */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop&crop=center"
          alt="Mountain landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-8xl items-center justify-between p-4 sm:p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <img src="/images/logo.svg" className="h-10 sm:h-12 w-auto" alt="Daisy logo" />
            </a>
          </div>
          <div className="flex flex-1 justify-end items-center lg:space-x-4 xl:space-x-8">
            <div className="hidden lg:flex lg:gap-x-8 xl:gap-x-12">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="text-base xl:text-lg font-medium leading-6 text-white hover:text-gray-300 transition-colors whitespace-nowrap">
                  {item.name}
                </a>
              ))}
            </div>
            <div className="hidden lg:flex lg:justify-end lg:gap-x-3 xl:gap-x-4 lg:items-center">
              <Button
                variant="outline"
                className="text-white border-white bg-transparent rounded-full px-4 xl:px-6 py-2 text-sm xl:text-base"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                onClick={onGetStarted}
                className="bg-[#FFDC61] text-black hover:bg-gray-200 rounded-full px-4 xl:px-6 py-2 text-sm xl:text-base"
              >
                Talk To Daisy
              </Button>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
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
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Daisy</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">Daisy</span>
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-8 flow-root">
                <div className="-my-6 divide-y divide-gray-500/25">
                  <div className="space-y-3 py-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-4 py-3 text-lg font-semibold leading-7 text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="py-6 space-y-4">
                    <div className="mb-6">
                      <LanguageSwitcher />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-gray-800 py-3 text-base"
                      onClick={() => router.push('/login')}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={onGetStarted}
                      className="w-full bg-white text-black hover:bg-gray-200 py-3 text-base"
                    >
                      Talk To Daisy
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
          className="text-center mb-12 sm:mb-16 lg:mb-20 pt-20 sm:pt-24 lg:pt-0"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-white leading-tight px-4">
            Daisy - Your 24/7 <br />
            Mental Health Companion
          </h1>
        </motion.div>

        <div className="absolute bottom-8 sm:bottom-12 lg:bottom-16 flex px-4 sm:px-6 flex-col lg:flex-row items-center lg:items-end justify-between gap-6 sm:gap-8 w-full max-w-8xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md text-center lg:text-left"
          >
            <p className="text-base sm:text-lg leading-6 sm:leading-8 text-white mb-6">
              A smart, personalized tool to support your mental well-being anytime and anywhere
            </p>
            <Button
              onClick={onGetStarted}
              className="rounded-full bg-[#FFDC61] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-black shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white w-full sm:w-auto"
            >
              Am I A Candidate?
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full lg:w-auto"
          >
            <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3 sm:p-4 ring-1 ring-white/20">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-white">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white text-center sm:whitespace-nowrap">{feature.name}</div>
                    {index < features.length - 1 && <div className="hidden sm:block h-8 w-px bg-white/50 ml-0 sm:ml-6"></div>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}