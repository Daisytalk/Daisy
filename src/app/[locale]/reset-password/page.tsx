'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Progress } from '@/shared/ui/progress'
import Image from 'next/image'

function ResetPasswordForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const passwordStrength = password.length > 0
    ? password.length < 6
      ? 'weak'
      : password.length < 10
        ? 'medium'
        : 'strong'
    : null
  const getPasswordStrengthValue = () =>
    !passwordStrength ? 0 : passwordStrength === 'weak' ? 33 : passwordStrength === 'medium' ? 66 : 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || t('resetPasswordError'))
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetPasswordError'))
    } finally {
      setIsLoading(false)
    }
  }

  // Нет токена — ссылка битая
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {t('resetPasswordInvalidLink')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('resetPasswordInvalidLinkDesc')}
          </p>
        </div>
        <Link href={`/${locale}/forgot-password`}>
          <Button className="h-12 rounded-2xl px-8">
            {t('forgotPasswordSubmit')}
          </Button>
        </Link>
      </div>
    )
  }

  // Успешно сменили пароль
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {t('resetPasswordSuccessTitle')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('resetPasswordSuccessDesc')}
          </p>
        </div>
        <Link href={`/${locale}/login`}>
          <Button className="h-12 rounded-2xl px-8 w-full">
            {t('signIn')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <KeyRound className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-1">
        {t('resetPasswordTitle')}
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        {t('resetPasswordDesc')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="rounded-2xl border-0 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            {t('newPassword')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('createPasswordPlaceholder')}
              required
              disabled={isLoading}
              className="h-12 rounded-2xl border-2 border-input bg-transparent px-4 pr-12 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            {t('confirmPassword')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
              required
              disabled={isLoading}
              className="h-12 rounded-2xl border-2 border-input bg-transparent px-4 pr-12 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-2xl font-medium text-base"
          disabled={isLoading || !password.trim() || !confirmPassword.trim()}
        >
          {isLoading ? t('resetPasswordSubmitting') : t('resetPasswordSubmit')}
        </Button>
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {t('rememberPassword')}{' '}
        <Link
          href={`/${locale}/login`}
          className="font-semibold text-primary hover:underline underline-offset-2"
        >
          {t('signIn')}
        </Link>
      </p>
    </>
  )
}

export default function ResetPasswordPage() {
  const locale = useLocale()

  return (
    <div className="min-h-screen flex bg-[hsl(var(--app-bg))]">
      {/* Left: Brand / Visual */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-12 xl:p-16 text-primary-foreground">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-white/10 blur-xl" />
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-primary-foreground/90 font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            Daisy
          </span>
        </div>
        <div className="relative z-10 space-y-8">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20 mb-4">
            <Image src="/images/daisy-icon.png" alt="Daisy" width={80} height={80} className="object-cover" />
          </div>
          <h2 className="text-3xl xl:text-4xl font-semibold leading-tight max-w-sm">
            Новый пароль
          </h2>
          <p className="text-primary-foreground/90 text-lg max-w-sm leading-relaxed">
            Создайте надёжный пароль, чтобы защитить ваш аккаунт и продолжить работу с Daisy.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-x-6 gap-y-1 text-sm text-primary-foreground/75">
          <span>Безопасно</span>
          <span>·</span>
          <span>Конфиденциально</span>
          <span>·</span>
          <span>24/7</span>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 lg:py-16 lg:pl-14 xl:pl-20 relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="w-full max-w-[400px] mx-auto lg:mx-0 relative z-10">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к входу
          </Link>

          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Daisy</h1>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
