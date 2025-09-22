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
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started with your mental health journey is simple and straightforward
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 transform -translate-x-1/2 z-0"></div>
              )}
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
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
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to start your journey?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands who have found support and healing through our platform
            </p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}