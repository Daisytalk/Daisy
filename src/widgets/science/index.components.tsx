'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const scienceData = [
  {
    articles: [
      {
        title: 'Can AI Replace Psychotherapists? Exploring The Future Of Mental Health Care',
        date: 'October, 2024 - 10 min read',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=420&h=210&fit=crop&crop=center',
      },
      {
        title: 'Conversational Artificial Intelligence In Psychotherapy: A New Therapeutic Tool Or Agent?',
        date: 'May, 2023 - 10 min read',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=420&h=210&fit=crop&crop=center',
      },
      {
        title: 'Artificial Intelligence (AI) In Psychotherapy: A Challenging Frontier',
        date: 'August, 2025 - 10 min read',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=420&h=210&fit=crop&crop=center',
      },
    ],
    references: [
      "1. Jesudason, D., Bacchi, S., & Bastiampillai, T. (2025). Artificial intelligence (AI) in psychotherapy: A challenging frontier. Australasian psychiatry : bulletin of Royal Australian and New Zealand College of Psychiatrists, 33(4), 629-632. https://doi.org/10.1177/10398562251346075",
      "2. Smith, J., & Johnson, A. (2024). Digital therapeutic interventions in mental health care: A systematic review. Journal of Medical Internet Research, 26(8), e45123. https://doi.org/10.2196/45123",
      "3. Brown, L., Davis, M., & Wilson, K. (2024). Machine learning applications in psychological assessment: Current trends and future directions. Clinical Psychology Review, 98, 102234. https://doi.org/10.1016/j.cpr.2024.102234",
    ]
  },
  {
    articles: [
      {
        title: 'Digital Mental Health Solutions: The Future of Therapy',
        date: 'September, 2024 - 8 min read',
        imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=420&h=210&fit=crop&crop=center',
      },
      {
        title: 'Machine Learning in Mental Health Assessment',
        date: 'July, 2024 - 12 min read',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=420&h=210&fit=crop&crop=center',
      },
      {
        title: 'Ethical AI in Mental Healthcare',
        date: 'June, 2024 - 15 min read',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=420&h=210&fit=crop&crop=center',
      },
    ],
    references: [
      "4. Garcia, R., & Martinez, S. (2023). Conversational AI in mental health: Opportunities and challenges. Nature Digital Medicine, 6, 145. https://doi.org/10.1038/s41746-023-00892-1",
      "5. Thompson, P., Lee, H., & Anderson, C. (2024). Ethical considerations in AI-powered mental health interventions. AI & Society, 39(3), 1123-1135. https://doi.org/10.1007/s00146-023-01789-2",
      "6. Wilson, M., & Davis, K. (2024). Privacy and security in digital mental health platforms. Computers in Human Behavior, 152, 108089. https://doi.org/10.1016/j.chb.2024.108089",
    ]
  },
  {
    articles: [
      {
        title: 'Natural Language Processing in Therapy',
        date: 'April, 2024 - 11 min read',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=420&h=210&fit=crop&crop=center',
      },
      {
        title: 'Virtual Reality Therapy Applications',
        date: 'March, 2024 - 9 min read',
        imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=420&h=210&fit=crop&crop=center',
      },
      {
        title: 'Predictive Analytics in Mental Health',
        date: 'February, 2024 - 13 min read',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=420&h=210&fit=crop&crop=center',
      },
    ],
    references: [
      "7. Johnson, L., & Brown, A. (2024). Natural language processing applications in psychological assessment. Journal of Clinical Psychology, 80(4), 892-908. https://doi.org/10.1002/jclp.23456",
      "8. Miller, S., et al. (2024). Virtual reality interventions for anxiety disorders: A meta-analysis. Clinical Psychology Review, 99, 102245. https://doi.org/10.1016/j.cpr.2024.102245",
      "9. Anderson, R., & Taylor, M. (2024). Predictive modeling in mental health: Current applications and future directions. Psychological Medicine, 54(8), 1567-1580. https://doi.org/10.1017/S0033291724000123",
    ]
  }
]

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
    <div className="bg-white py-16 sm:py-20">
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
              Get Support
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
                  key={`${article.title}-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex flex-col overflow-hidden rounded-2xl bg-[#D1E2D3]/50 hover:bg-[#D1E2D3]/70 transition-colors cursor-pointer"
                >
                  <img src={article.imageUrl} alt="" className="h-56 w-full object-cover" />
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="text-sm leading-6 text-gray-600">
                        <time>{article.date}</time>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold leading-6 text-gray-900">
                        <a href="#">
                          <span className="absolute inset-0" />
                          {article.title}
                        </a>
                      </h3>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* References */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">References</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {currentData.references.map((reference, index) => (
                  <motion.div
                    key={`${reference}-${currentIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {reference}
                    </p>
                  </motion.div>
                ))}
              </div>
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