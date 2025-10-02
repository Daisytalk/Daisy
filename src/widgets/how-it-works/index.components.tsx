'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, MessageCircle, TrendingUp } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your secure account and complete a brief assessment to help us understand your needs.',
    step: '01'
  },
  {
    icon: Search,
    title: 'Get Matched',
    description: 'Our algorithm matches you with licensed therapists who specialize in your specific concerns.',
    step: '02'
  },
  {
    icon: MessageCircle,
    title: 'Start Therapy',
    description: 'Begin your mental health journey with secure messaging, video calls, or phone sessions.',
    step: '03'
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor your mental health journey with personalized insights and progress tracking.',
    step: '04'
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Getting started with your mental health journey is simple and straightforward
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connection Line - Desktop Only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 sm:top-14 lg:top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 transform -translate-x-1/2 z-0"></div>
              )}
              
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <step.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                </div>
                
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                  {step.step}
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {step.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 lg:p-12">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready to start your journey?
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
              Join thousands who have found support and healing through our platform
            </p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-colors w-full sm:w-auto">
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}