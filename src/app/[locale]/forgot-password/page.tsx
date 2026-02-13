'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || t('forgotPasswordError'))
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forgotPasswordError'))
    } finally {
      setIsLoading(false)
    }
  }

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
            {t('forgotPasswordTitle')}
          </h2>
          <p className="text-primary-foreground/90 text-lg max-w-sm leading-relaxed">
            {t('forgotPasswordBrandDesc')}
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
            {t('backToLogin')}
          </Link>

          {isSubmitted ? (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {t('forgotPasswordSentTitle')}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t('forgotPasswordSentDesc')}
                </p>
                <p className="text-sm font-medium text-foreground mt-2">{email}</p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl"
                  onClick={() => { setIsSubmitted(false); setEmail('') }}
                >
                  {t('forgotPasswordResend')}
                </Button>
                <Link href={`/${locale}/login`} className="block">
                  <Button className="w-full h-12 rounded-2xl">
                    {t('backToLogin')}
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('forgotPasswordCheckSpam')}
              </p>
            </div>
          ) : (
            <>
              <div className="lg:hidden mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Daisy</h1>
              </div>

              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-1">
                {t('forgotPasswordTitle')}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                {t('forgotPasswordDesc')}
              </p>

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

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl font-medium text-base"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? t('forgotPasswordSending') : t('forgotPasswordSubmit')}
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
          )}
        </div>
      </div>
    </div>
  )
}
