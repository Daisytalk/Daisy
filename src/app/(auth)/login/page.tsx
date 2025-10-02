"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ClientOnly } from '@/shared/components/ClientOnly'

function LoginPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center"
      >
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Oops! Looks like Daisy is in high demand today.  
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            We're temporarily unavailable while we make Daisy even better for you.
          </p>
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
            Login is temporarily disabled. Please join our waitlist to be notified when we're back!
          </div>
        </div>

        <Link
          href="/waitlist"
          className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors text-sm sm:text-base inline-block"
        >
          Join Waitlist ❤️
        </Link>

        <p className="mt-6 text-xs sm:text-sm text-gray-500 italic">
          please check your inbox... Daisy will reach you out right about the time!
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ClientOnly>
      <LoginPageContent />
    </ClientOnly>
  )
}