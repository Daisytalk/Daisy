'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function HelpTopicsSection() {
  const t = useTranslations('helpTopics')
  
  const topics = [
    {
      number: "01",
      title: t('topic1Title'),
      description: t('topic1Desc')
    },
    {
      number: "02",
      title: t('topic2Title'),
      description: t('topic2Desc')
    },
    {
      number: "03",
      title: t('topic3Title'),
      description: t('topic3Desc')
    },
    {
      number: "04",
      title: t('topic4Title'),
      description: t('topic4Desc')
    },
    {
      number: "05",
      title: t('topic5Title'),
      description: t('topic5Desc')
    },
    {
      number: "06",
      title: t('topic6Title'),
      description: t('topic6Desc')
    }
  ]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % topics.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % topics.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + topics.length) % topics.length)
  }

  const getVisibleTopics = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push({
        ...topics[(currentIndex + i) % topics.length],
        originalIndex: (currentIndex + i) % topics.length
      })
    }
    return visible
  }

  return (
    <div id="how-it-works" className="relative py-24 sm:py-32 scroll-mt-20">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1750650983022-874bab0db460?w=1920&h=1080&fit=crop&crop=center"
          alt="Mountain landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 w-full lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-center gap-x-2 text-lg font-medium text-white hover:text-gray-600 transition-colors">
            <Sparkles className="h-5 w-5" />
            {t('howItWorks')}
          </div>
          <div className="max-w-xl text-left lg:text-right">
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {t('title')}
            </h2>
          </div>
        </div>

        <div className="mt-16 relative">
          {/* Left Navigation - Desktop Only */}
          <button
            onClick={prevSlide}
            className="hidden xl:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white items-center justify-center hover:bg-white/30 transition-colors -translate-x-16"
            aria-label="Previous topics"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="flex justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="overflow-hidden">
              <div className="flex space-x-8 transition-transform duration-500 ease-in-out">
                {getVisibleTopics().map((topic, index) => (
                  <motion.div
                    key={`${topic.number}-${topic.originalIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex-shrink-0 w-[360px] h-[360px] flex flex-col justify-between bg-black/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
                  >
                    <div>
                      <p className="text-4xl font-medium text-white/70">{topic.number}</p>
                      <h3 className="mt-4 text-3xl font-medium text-white">{topic.title}</h3>
                    </div>
                    <p className="text-base text-white">{topic.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {topics.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                aria-label={`Go to topic ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Navigation - Desktop Only */}
          <button
            onClick={nextSlide}
            className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white items-center justify-center hover:bg-white/30 transition-colors translate-x-16"
            aria-label="Next topics"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <a href="#" className="rounded-full bg-[#FFDC61] px-8 py-4 text-lg font-semibold text-black shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors">
             {t('talkToDaisy')}
          </a>
        </motion.div>
      </div>
    </div>
  )
}