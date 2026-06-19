'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'
import { mergePendingOnboarding } from '@/shared/lib/pending-onboarding'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { defaultLocale } from '@/i18n'

/** Защита от open redirect: только относительные пути с префиксом локали. */
function safeRedirectAfterLogin(next: string | null, locale: string): string {
  const fallback = `/${locale}/profile`
  if (!next || !next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.includes('..') || next.includes('\\')) return fallback
  if (!/^\/[a-z]{2}\//.test(next)) return fallback
  return next
}

function LoginPageContent() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const nextAfterLogin = searchParams.get('next')
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
      const data = await authService.login({ email, password }) as { user: unknown; requiresRestore?: boolean }

      if (data.requiresRestore) {
        window.location.href = `/${locale || defaultLocale}/restore-account`
        return
      }

      const merged = await mergePendingOnboarding()
      if (merged) {
        window.location.href = `/${locale || defaultLocale}/chat`
        return
      }

      window.location.href = safeRedirectAfterLogin(nextAfterLogin, locale || defaultLocale)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[hsl(var(--app-bg))]">
      {/* Left: Brand / Visual — фото + оверлей */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between relative overflow-hidden p-12 xl:p-16 text-sky-900">
        <Image
          src="/images/log-reg-photo.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1024px) 0vw, 52vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/70 via-sky-900/30 to-transparent" />
        <div className="absolute inset-0 bg-sky-100/20" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-white/95 font-medium tracking-wide drop-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
            Daisy
          </span>
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl xl:text-4xl font-semibold leading-tight max-w-sm whitespace-pre-line text-white drop-shadow-md">
            {t('loginPageTitle')}
          </h2>
          <p className="text-white/95 text-lg max-w-sm leading-relaxed drop-shadow-sm">
            {t('loginPageDesc')}
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/85">
          <span>{t('badgeCompanion')}</span>
          <span>·</span>
          <span>{t('badgePrivate')}</span>
          <span>·</span>
          <span>{t('badge24_7')}</span>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 lg:py-16 lg:pl-14 xl:pl-20 relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="w-full max-w-[400px] mx-auto lg:mx-0 relative z-10">
          <div className="lg:hidden mb-10">
            <h1 className="text-2xl font-semibold text-foreground">Daisy</h1>
            <p className="text-muted-foreground mt-1">{t('loginPageDesc')}</p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-1">{t('signIn')}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t('enterCredentials')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-0 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                disabled={isLoading}
                className="h-12 rounded-2xl border-2 border-input bg-transparent px-4 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('password')}
                </Label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-primary hover:underline underline-offset-2"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
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
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? t('signingIn') : t('signIn')}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-background text-muted-foreground">{t('orContinueWith')}</span>
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
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/register`}
              className="font-semibold text-primary hover:underline underline-offset-2"
            >
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--app-bg))] text-muted-foreground text-sm">
          Загрузка…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
