'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Video, Calendar, Shield, Heart, Clock } from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'Secure Messaging',
    description: 'Connect with licensed therapists through encrypted, HIPAA-compliant messaging for ongoing support.',
  },
  {
    icon: Video,
    title: 'Video Sessions',
    description: 'Face-to-face therapy sessions from the comfort of your home with high-quality video calls.',
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book appointments that fit your schedule with 24/7 availability and easy rescheduling.',
  },
  {
    icon: Shield,
    title: 'Privacy Protected',
    description: 'Your conversations are completely confidential with bank-level security and HIPAA compliance.',
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'Matched with therapists who specialize in your specific needs and mental health goals.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Crisis support and emergency resources available around the clock when you need them most.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            What Can Daisy Help You With?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Comprehensive mental health support designed to meet you wherever you are in your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-sm"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">10K+</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">Licensed Therapists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">Support Available</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}