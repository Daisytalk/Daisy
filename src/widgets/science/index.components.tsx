'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getAllResearchPapers, type ResearchPaper } from '@/shared/data/research-papers'

// Group papers into sets of 3 for carousel
const allPapers = getAllResearchPapers()
const scienceData: { articles: ResearchPaper[] }[] = []
for (let i = 0; i < allPapers.length; i += 3) {
  scienceData.push({
    articles: allPapers.slice(i, i + 3)
  })
}

export function ScienceSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll both articles and references together
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % scienceData.length)
      }, 5000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isHovered])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % scienceData.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + scienceData.length) % scienceData.length)
  }

  const currentData = scienceData[currentIndex]

  return (
    <div id="science" className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-full justify-center items-center flex flex-col px-6 lg:px-8">
        <div className="flex flex-col w-full md:flex-row justify-between md:items-center gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Explore The <em>Science</em> Behind Daisy
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Read the latest scientific publications on the role of artificial intelligence and digital solutions in supporting mental health
            </p>

          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <a
              href="#"
              className="rounded-full px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-50 whitespace-nowrap self-start md:self-center transition-colors"
            >
              Talk to Daisy
            </a>

          </motion.div>
        </div>

        {/* Synchronized Carousel */}
        <div className="mt-16 relative flex flex-col justify-center max-w-7xl">
          {/* Left Navigation - Desktop Only */}
          <button
            onClick={prevSlide}
            className="hidden xl:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 shadow-lg items-center justify-center hover:bg-white transition-colors -translate-x-16"
            aria-label="Previous content"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div
            className="w-full flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Articles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {currentData.articles.map((article, index) => (
                <motion.article
                  key={`${article.slug}-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex flex-col overflow-hidden rounded-2xl bg-[#D1E2D3]/50 hover:bg-[#D1E2D3]/70 transition-colors cursor-pointer"
                >
                  <img src={article.imageUrl} alt={article.title} className="h-56 w-full object-cover" />
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="text-sm leading-6 text-gray-600">
                        <time>{article.date}</time>
                        <span className="mx-2">•</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold leading-6 text-gray-900">
                        <Link href={`/science/${article.slug}`}>
                          <span className="absolute inset-0" />
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {article.authors} ({article.year})
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Indicators */}
            <div className="flex justify-center mt-8 gap-3">
              {scienceData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  aria-label={`Go to content set ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Navigation - Desktop Only */}
          <button
            onClick={nextSlide}
            className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 shadow-lg items-center justify-center hover:bg-white transition-colors translate-x-16"
            aria-label="Next content"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}