'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, Sparkles, AlertCircle, Check } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'
import { Button } from '@/shared/ui/ui/button'
import { Input } from '@/shared/ui/ui/input'
import { Label } from '@/shared/ui/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/ui/alert'
import { Progress } from '@/shared/ui/ui/progress'

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
      setError(t('passwordsDoNotMatch'))
      return
    }

    if (formData.password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }

    setIsLoading(true)

    try {
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

      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/${locale}/chat`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registrationFailed'))
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

  const getPasswordStrengthValue = () => {
    if (!passwordStrength) return 0
    if (passwordStrength === 'weak') return 33
    if (passwordStrength === 'medium') return 66
    return 100
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('createAccount')}</h1>
          <p className="text-gray-600">{t('startJourneyDesc')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('signUp')}</CardTitle>
            <CardDescription>{t('createAccountDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {hasOnboardingData && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    {t('onboardingDataSaved')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('namePlaceholder')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('createPasswordPlaceholder')}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="space-y-1">
                    <Progress value={getPasswordStrengthValue()} className="h-1" />
                    <p className="text-xs text-gray-600">
                      {t('passwordStrength')}: <span className="font-medium capitalize">{t(`passwordStrength${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`)}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('confirmPasswordPlaceholder')}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('creatingAccount') : t('createAccount')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('orSignUpWith')}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/api/auth/google'}
              >
                <FaGoogle className="w-4 h-4 mr-2 text-[#4285F4]" />
                {t('google')}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {t('agreeToTerms')}{' '}
                <Link href="/terms" className="underline hover:text-gray-700">{t('termsOfService')}</Link>
                {' '}{t('and')}{' '}
                <Link href="/privacy" className="underline hover:text-gray-700">{t('privacyPolicy')}</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="font-semibold text-blue-600 hover:text-blue-700">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
