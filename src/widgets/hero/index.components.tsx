'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui'
import { LanguageSwitcher } from '@/shared/ui/language-switcher'
import { Menu, X, UserCircle, Beaker, Brain } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted?: () => void
  onLearnMore?: () => void
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Why Daisy', href: '#about' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
  ]

  const features = [
    {
      name: 'Personalized AI Companion',
      icon: Brain,
    },
    {
      name: 'Strong Scientific Background',
      icon: Beaker,
    },
    {
      name: 'Personalized AI Companion',
      icon: Brain,
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
        <nav className="mx-auto flex max-w-8xl items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <img src="/images/logo.svg" className="h-16 w-auto" alt="Daisy logo" />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center space-x-8">
            <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="text-lg font-medium leading-6 text-white hover:text-gray-300 transition-colors">
                  {item.name}
                </a>
              ))}
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
              <LanguageSwitcher />
              <Button
                variant="outline"
                className="text-white border-white bg-transparent rounded-full px-6 py-2"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
              <Button
                onClick={() => window.location.href = '/register'}
                className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2"
              >
                Talk To Daisy
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50" />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
              <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Daisy</span>
                  <span className="text-2xl font-bold text-white">Daisy</span>
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/25">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="py-6 space-y-2">
                    <div className="mb-4">
                      <LanguageSwitcher />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-gray-800"
                      onClick={() => window.location.href = '/login'}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/register'}
                      className="w-full bg-white text-black hover:bg-gray-200"
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
      <div className="mx-auto max-w-8xl px-6 lg:px-8 min-h-screen flex flex-col justify-center items-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-tight">
            Daisy - Your 24/7<br />
            Mental Health Companion
          </h1>
        </motion.div>

        <div className="absolute bottom-16 flex px-6 flex-col md:flex-row items-end justify-between gap-8 w-full max-w-8xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md text-left"
          >
            <p className="text-lg leading-8 text-white mb-6">
              A smart, personalized tool to support your mental well-being anytime and anywhere
            </p>
            <Button
              onClick={() => window.location.href = '/register'}
              className="rounded-full bg-[#7E9EC4] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Am I A Candidate?
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-auto"
          >
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-4 ring-1 ring-white/20">
              <div className="flex items-center gap-x-6 text-center">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-x-3">
                    <div className="text-white">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="text-sm font-semibold text-white whitespace-nowrap">{feature.name}</div>
                    {index < features.length - 1 && <div className="h-8 w-px bg-white/50 ml-6"></div>}
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