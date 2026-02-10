'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, Sparkles, AlertCircle, Check } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Progress } from '@/shared/ui/progress'

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
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-app-lg mb-6">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{t('createAccount')}</h1>
          <p className="text-muted-foreground">{t('startJourneyDesc')}</p>
        </div>

        <Card className="border-app-border rounded-app-lg shadow-app-md overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{t('signUp')}</CardTitle>
            <CardDescription>{t('createAccountDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-app">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {hasOnboardingData && (
                <Alert className="rounded-app border-app-border bg-app-surface-hover">
                  <Check className="h-4 w-4" />
                  <AlertDescription>{t('onboardingDataSaved')}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">{t('name')}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('namePlaceholder')}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-app border-app-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-app border-app-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
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
                    className="h-11 rounded-app border-app-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="space-y-1">
                    <Progress value={getPasswordStrengthValue()} className="h-1.5 rounded-full" />
                    <p className="text-xs text-muted-foreground">
                      {t('passwordStrength')}: <span className="font-medium capitalize">{t(`passwordStrength${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`)}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">{t('confirmPassword')}</Label>
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
                    className="h-11 rounded-app border-app-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-app font-medium" disabled={isLoading}>
                {isLoading ? t('creatingAccount') : t('createAccount')}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-app-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-app-surface text-muted-foreground">{t('orSignUpWith')}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-app border-app-border hover:bg-app-surface-hover"
                onClick={() => window.location.href = '/api/auth/google'}
              >
                <FaGoogle className="w-4 h-4 mr-2 text-[#4285F4]" />
                {t('google')}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {t('agreeToTerms')}{' '}
                <Link href="/terms" className="underline hover:text-foreground">{t('termsOfService')}</Link>
                {' '}{t('and')}{' '}
                <Link href="/privacy" className="underline hover:text-foreground">{t('privacyPolicy')}</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="font-semibold text-primary hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
