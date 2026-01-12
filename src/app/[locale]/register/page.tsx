'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Check, AlertCircle } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasOnboardingData, setHasOnboardingData] = useState(false)

  useEffect(() => {
    const onboardingData = localStorage.getItem('pending_onboarding')
    setHasOnboardingData(!!onboardingData)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const onboardingData = localStorage.getItem('pending_onboarding')
      const onboardingAnswers = onboardingData ? JSON.parse(onboardingData) : null

      const authService = new AuthApiService()
      const data = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`

      localStorage.removeItem('pending_onboarding')
      localStorage.removeItem('onboarding_session_id')

      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/${locale}/chat`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const passwordStrength = formData.password.length > 0 ? (
    formData.password.length < 6 ? 'weak' :
    formData.password.length < 10 ? 'medium' : 'strong'
  ) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#FFDC61]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-[#D1E2D3]/20 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100 order-2 lg:order-1"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('createAccount')}</h2>
            <p className="text-gray-600">{t('startJourneyDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                {t('name')}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('namePlaceholder')}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('createPasswordPlaceholder')}
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
              {passwordStrength && (
                <div className="flex gap-2 mt-2">
                  <div className={`h-1.5 flex-1 rounded-full ${passwordStrength === 'weak' ? 'bg-red-500' : 'bg-gray-200'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

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

            {hasOnboardingData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
              >
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{t('onboardingDataSaved')}</span>
              </motion.div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded border-gray-300 text-[#FFDC61] focus:ring-[#FFDC61]"
              />
              <span className="text-sm text-gray-600">
                {t('agreeToTerms')}{' '}
                <Link href={`/${locale}/terms`} className="font-semibold text-gray-900 hover:text-gray-700">
                  {t('termsOfService')}
                </Link>{' '}
                {t('and')}{' '}
                <Link href={`/${locale}/privacy`} className="font-semibold text-gray-900 hover:text-gray-700">
                  {t('privacyPolicy')}
                </Link>
              </span>
            </label>

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
                  {t('creatingAccount')}
                </span>
              ) : (
                t('createAccount')
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('orSignUpWith')}</span>
              </div>
            </div>

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

          <p className="mt-8 text-center text-sm text-gray-600">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              {t('signIn')}
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 order-1 lg:order-2"
        >
          <div className="inline-flex items-center gap-2 bg-[#D1E2D3]/30 px-4 py-2 rounded-full">
            <Sparkles className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-700">{t('joinThousands')}</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
            {t('startJourney')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Daisy</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            {t('experiencePersonalized')}
          </p>

          <div className="space-y-4 pt-4">
            {[
              { title: t('benefit1Title'), desc: t('benefit1Desc') },
              { title: t('benefit2Title'), desc: t('benefit2Desc') },
              { title: t('benefit3Title'), desc: t('benefit3Desc') },
              { title: t('benefit4Title'), desc: t('benefit4Desc') }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100"
              >
                <div className="w-8 h-8 bg-[#FFDC61] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}