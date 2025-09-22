'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Users, Heart, Shield, ChevronLeft, ChevronRight } from 'lucide-react'

const aboutData = [
  {
    title: "Our Mission is Personal",
    subtitle: "HOW IT STARTED",
    content: "Mental health is the #1 public health crisis, affecting millions of American families, including our Founder's. Dylan Beynon's mother and sister struggled with severe mental illness, addiction, and homelessness. He lost both to overdoses. Growing up with a violent and abusive parent, Dylan suffered from PTSD, holding him back from helping himself and others.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
    buttonText: "Our Story"
  },
  {
    title: "Mental Health Care That Puts You First",
    subtitle: "OUR APPROACH",
    content: "At Daisy, we're revolutionizing mental health care by making it accessible, affordable, and personalized. Our platform connects you with licensed therapists who understand your unique needs and circumstances. We use evidence-based approaches backed by scientific research.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
    buttonText: "Learn More"
  },
  {
    title: "Our Core Values",
    subtitle: "WHAT DRIVES US",
    content: "We believe everyone deserves access to quality mental health support with empathy and understanding. Your privacy and confidentiality are our top priorities. Our network consists of licensed, experienced mental health professionals who deliver proven results.",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=center",
    buttonText: "Our Values"
  }
]

export function AboutSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % aboutData.length)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % aboutData.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + aboutData.length) % aboutData.length)
  }

  const currentData = aboutData[currentIndex]

  return (
    <section className="py-24 bg-[#D1E2D3]">
      <div className="max-w-7xl mx-auto px-6">
        {/* About Carousel */}
        <div className="relative">
          {/* Left Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-colors -translate-x-16"
            aria-label="Previous content"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div 
            className="flex justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl">
              {/* Content */}
              <motion.div
                key={`content-${currentIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  {currentData.title}
                </h1>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  {currentData.content}
                </p>
                <button className="rounded-full border-2 border-gray-900 px-8 py-3 text-lg font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                  {currentData.buttonText}
                </button>
              </motion.div>

              {/* Image */}
              <motion.div
                key={`image-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2 flex flex-col items-end"
              >
                <div className="mb-4 text-right">
                  <p className="text-sm font-semibold text-gray-600 tracking-wider">
                    {currentData.subtitle}
                  </p>
                </div>
                <div className="w-80 h-80 rounded-full overflow-hidden">
                  <img 
                    src={currentData.image} 
                    alt={currentData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Navigation */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-colors translate-x-16"
            aria-label="Next content"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-12 gap-3">
          {aboutData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-700' : 'bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}