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
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Can Daisy Help You With?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive mental health support designed to meet you wherever you are in your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
          className="bg-white rounded-2xl p-8 md:p-12 shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-gray-600">Licensed Therapists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}