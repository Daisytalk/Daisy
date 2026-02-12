'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Alert, AlertDescription } from '@/shared/ui/alert'

export default function LoginPage() {
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

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`

      window.location.href = `/${locale}/dashboard`
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[hsl(var(--app-bg))]">
      {/* Left: Brand / Visual (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-12 xl:p-16 text-primary-foreground">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-white/10 blur-xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-primary-foreground/90 font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            Daisy
          </span>
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl xl:text-4xl font-semibold leading-tight max-w-sm">
            {t('welcomeBack')}
          </h2>
          <p className="text-primary-foreground/90 text-lg max-w-sm leading-relaxed">
            {t('continueJourney')}
          </p>
          <blockquote className="border-l-4 border-white/30 pl-5 text-primary-foreground/80 italic text-sm max-w-xs">
            A safe space to reflect and grow.
          </blockquote>
        </div>
        <div className="relative z-10 flex flex-wrap gap-x-6 gap-y-1 text-sm text-primary-foreground/75">
          <span>AI therapy</span>
          <span>·</span>
          <span>Private & safe</span>
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
          <div className="lg:hidden mb-10">
            <h1 className="text-2xl font-semibold text-foreground">Daisy</h1>
            <p className="text-muted-foreground mt-1">{t('continueJourney')}</p>
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
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('password')}
              </Label>
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
