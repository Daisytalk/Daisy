'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { AuthApiService } from '@/shared/services/auth'
import { mergePendingOnboarding } from '@/shared/lib/pending-onboarding'

function OAuthCompleteContent() {
  const router = useRouter()
  const locale = useLocale()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function finish() {
      try {
        const token = localStorage.getItem('auth_token')
        const merged = await mergePendingOnboarding(token)

        const authService = new AuthApiService()
        const user = await authService.getCurrentUser()
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        }

        if (cancelled) return

        const onboarded = merged || user?.isOnboarded
        router.replace(onboarded ? `/${locale}/chat` : `/${locale}/onboarding`)
      } catch {
        if (!cancelled) {
          setError('sign_in_failed')
          router.replace(`/${locale}/login?error=oauth_complete_failed`)
        }
      }
    }

    void finish()
    return () => {
      cancelled = true
    }
  }, [locale, router])

  if (error) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--app-bg))]">
      <p className="text-muted-foreground text-sm">…</p>
    </div>
  )
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={null}>
      <OAuthCompleteContent />
    </Suspense>
  )
}
