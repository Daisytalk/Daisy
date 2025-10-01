'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

const testimonials = [
  {
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    author: "Guy Hawkins",
    date: "1/28/17",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&facepad=2",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=360&fit=crop&crop=center",
  },
  {
    quote: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    author: "Jane Doe",
    date: "2/15/18",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&facepad=2",
    imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=360&fit=crop&crop=center",
  },
  {
    quote: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
    author: "John Smith",
    date: "3/22/19",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&facepad=2",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=360&fit=crop&crop=center",
  },
]

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? testimonials.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const nextSlide = () => {
    const isLastSlide = currentIndex === testimonials.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  useEffect(() => {
    const timer = setTimeout(nextSlide, 10000)
    return () => clearTimeout(timer)
  }, [currentIndex])

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="flex flex-col h-full text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-block rounded-full border border-gray-800 px-4 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-800 hover:bg-gray-100 mb-6 sm:mb-8 transition-colors text-sm sm:text-base">
                Reviews
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6 leading-tight">
                Hear From Our<br />
                <em>Satisfied Customers</em>
              </h2>
              
              <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12">
                Our users share how short interaction brought long-lasting therapy
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-8 sm:mb-12"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">10k+</div>
              <div className="text-base sm:text-lg text-gray-600">people are receiving therapy</div>
            </motion.div>
          </div>

          {/* Right side - Testimonial Card */}
          <div className="relative">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src={currentTestimonial.imageUrl}
                  alt="Testimonial background"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                
                {/* Testimonial overlay */}
                <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6 right-3 sm:right-4 lg:right-6">
                  <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg">
                    <p className="text-gray-800 text-xs sm:text-sm lg:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                      "{currentTestimonial.quote}"
                    </p>
                    
                    <div className="flex items-center">
                      <img
                        src={currentTestimonial.avatarUrl}
                        alt={currentTestimonial.author}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">{currentTestimonial.author}</div>
                        <div className="text-gray-600 text-xs sm:text-sm">{currentTestimonial.date}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation arrows */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1 sm:gap-2">
              <button
                onClick={prevSlide}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-900/80 text-white flex items-center justify-center hover:bg-gray-700 transition-colors backdrop-blur-sm"
                aria-label="Previous testimonial"
              >
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-900/80 text-white flex items-center justify-center hover:bg-gray-700 transition-colors backdrop-blur-sm"
                aria-label="Next testimonial"
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            </div>


          </div>
        </div>
      </div>
    </section>
  )
}