'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { AuthApiService } from '@/shared/services/auth'

export default function RestoreAccountPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [isRestoring, setIsRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!cancelled && !res.ok) {
          router.replace(`/${locale}/login`)
        }
      })
    return () => {
      cancelled = true
    }
  }, [locale, router])

  const handleRestore = async () => {
    setError(null)
    setIsRestoring(true)
    try {
      const authService = new AuthApiService()
      await authService.restoreAccount()
      router.replace(`/${locale}/chat`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка восстановления')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleLogout = async () => {
    const authService = new AuthApiService()
    await authService.logout()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[hsl(var(--app-bg))]">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <RotateCcw className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t('accountDeactivated')}
        </h1>
        <p className="text-muted-foreground">
          {t('accountDeactivatedDesc')}
        </p>
        {error && (
          <div className="flex items-center gap-2 justify-center text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRestore}
            disabled={isRestoring}
            className="w-full h-12 rounded-2xl font-medium"
          >
            {isRestoring ? t('restoring') : t('restoreAccount')}
          </Button>
          <Link
            href={`/${locale}/login`}
            onClick={() => void handleLogout()}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Выйти и войти с другим аккаунтом
          </Link>
        </div>
      </div>
    </div>
  )
}
