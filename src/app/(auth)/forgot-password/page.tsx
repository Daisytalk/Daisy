"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

function ForgotPasswordContent() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Add your password reset logic here
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#FFDC61]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-[#D1E2D3]/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FFDC61] text-black font-semibold py-3.5 rounded-xl hover:bg-[#FFDC61]/90 focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FFDC61]/20"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                      />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h3>
              <p className="text-gray-600 mb-8">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-[#FFDC61] text-black font-semibold py-3.5 rounded-xl hover:bg-[#FFDC61]/90 transition-all"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="block w-full text-gray-600 hover:text-gray-900 py-2 text-sm transition-colors"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Help text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Need help?{' '}
          <Link href="/contact" className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
            Contact support
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <ClientOnly>
      <ForgotPasswordContent />
    </ClientOnly>
  )
}
