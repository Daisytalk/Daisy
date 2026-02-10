'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { AuthApiService } from '@/shared/services/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
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

      // Full page redirect so AuthProvider re-runs and sees the auth cookie; go to dashboard then to chat
      window.location.href = `/${locale}/dashboard`
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-app-lg mb-6">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{t('welcomeBack')} Daisy</h1>
          <p className="text-muted-foreground">{t('continueJourney')}</p>
        </div>

        <Card className="border-app-border rounded-app-lg shadow-app-md overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{t('signIn')}</CardTitle>
            <CardDescription>{t('enterCredentials')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-app">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
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
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <input type="checkbox" className="rounded border-app-border" />
                  <span>{t('rememberMe')}</span>
                </label>
                <Link href={`/${locale}/forgot-password`} className="text-primary hover:underline font-medium">
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 rounded-app font-medium" disabled={isLoading}>
                {isLoading ? t('signingIn') : t('signIn')}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-app-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-app-surface text-muted-foreground">{t('orContinueWith')}</span>
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
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/register`} className="font-semibold text-primary hover:underline">
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
