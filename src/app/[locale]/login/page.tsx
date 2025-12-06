'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const authService = new AuthApiService()
      const data = await authService.login({ email, password })

      // Store auth token and user data
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Set cookie for middleware
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

      // Show success message briefly before redirect
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to dashboard
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
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

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-[#FFDC61]/20 px-4 py-2 rounded-full">
            <Sparkles className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-700">{t('aiPoweredSupport')}</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
            {t('welcomeBack')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Daisy</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            {t('continueJourney')}
          </p>

          <div className="space-y-4 pt-4">
            {[t('feature1'), t('feature2'), t('feature3')].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-[#FFDC61] rounded-full" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('signIn')}</h2>
            <p className="text-gray-600">{t('enterCredentials')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#FFDC61] focus:ring-[#FFDC61]"
                />
                <span className="text-sm text-gray-600">{t('rememberMe')}</span>
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
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
                  {t('signingIn')}
                </span>
              ) : (
                t('signIn')
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => window.location.href = '/api/auth/google'}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FaGoogle className="w-5 h-5 text-[#4285F4]" />
                <span className="text-sm font-medium text-gray-700">{t('google')}</span>
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/register`} className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              {t('signUp')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
