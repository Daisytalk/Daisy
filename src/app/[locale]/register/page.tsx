'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Progress } from '@/shared/ui/progress'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    consentDataProcessing: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasOnboardingData, setHasOnboardingData] = useState(false)

  useEffect(() => {
    setHasOnboardingData(!!localStorage.getItem('pending_onboarding'))
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
    if (!formData.consentDataProcessing) {
      setError(t('consentRequired'))
      return
    }
    setIsLoading(true)
    try {
      let onboardingAnswers: Record<string, unknown> | undefined
      try {
        const pending = localStorage.getItem('pending_onboarding')
        if (pending) {
          const answers: { questionId: string; answer: unknown }[] = JSON.parse(pending)
          onboardingAnswers = Object.fromEntries(answers.map((a) => [a.questionId, a.answer]))
        }
      } catch {
        // ignore
      }
      const authService = new AuthApiService()
      const data = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(onboardingAnswers && Object.keys(onboardingAnswers).length > 0 && { onboardingAnswers }),
      })
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`
      localStorage.removeItem('pending_onboarding')
      await new Promise(resolve => setTimeout(resolve, 300))
      // Если отправили ответы онбординга — уже онбордированы, идём в чат; иначе — в онбординг
      window.location.href = data.user?.isOnboarded ? `/${locale}/chat` : `/${locale}/onboarding`
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registrationFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const passwordStrength = formData.password.length > 0
    ? formData.password.length < 6
      ? 'weak'
      : formData.password.length < 10
        ? 'medium'
        : 'strong'
    : null
  const getPasswordStrengthValue = () =>
    !passwordStrength ? 0 : passwordStrength === 'weak' ? 33 : passwordStrength === 'medium' ? 66 : 100

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand / Visual */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 xl:p-16 text-primary-foreground">
        <div>
          <span className="text-primary-foreground/90 font-medium tracking-wide">Daisy</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl xl:text-4xl font-semibold leading-tight max-w-sm">
            {t('createAccount')}
          </h2>
          <p className="text-primary-foreground/85 text-lg max-w-sm">
            {t('startJourneyDesc')}
          </p>
        </div>
        <div className="flex gap-6 text-sm text-primary-foreground/75">
          <span>Next: quick onboarding</span>
          <span>·</span>
          <span>Then start chatting</span>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 lg:py-16 lg:pl-14 xl:pl-20 overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto lg:mx-0">
          <div className="lg:hidden mb-10">
            <h1 className="text-2xl font-semibold text-foreground">Daisy</h1>
            <p className="text-muted-foreground mt-1">{t('startJourneyDesc')}</p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-1">{t('signUp')}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t('createAccountDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-0 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {hasOnboardingData && (
              <Alert className="rounded-2xl border border-primary/20 bg-primary/5">
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
                className="h-12 rounded-2xl border-2 border-input bg-transparent px-4"
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
                className="h-12 rounded-2xl border-2 border-input bg-transparent px-4"
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
                  className="h-12 rounded-2xl border-2 border-input bg-transparent px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                  className="h-12 rounded-2xl border-2 border-input bg-transparent px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="consentDataProcessing"
                checked={formData.consentDataProcessing}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1 rounded border-input"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground">
                {t('consentDataProcessing')}
              </span>
            </label>

            <Button type="submit" className="w-full h-12 rounded-2xl font-medium" disabled={isLoading}>
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-background text-muted-foreground">{t('orSignUpWith')}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-input bg-transparent hover:bg-muted/50"
              onClick={() => window.location.href = '/api/auth/google'}
            >
              <FaGoogle className="w-5 h-5 mr-2 text-[#4285F4]" />
              {t('google')}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t('agreeToTerms')}{' '}
              <Link href="/terms" className="underline hover:text-foreground">{t('termsOfService')}</Link>
              {' '}{t('and')}{' '}
              <Link href="/privacy" className="underline hover:text-foreground">{t('privacyPolicy')}</Link>
            </p>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="font-semibold text-primary hover:underline underline-offset-2">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
