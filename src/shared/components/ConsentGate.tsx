'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { REQUIRED_CONSENT_TYPES, CURRENT_CONSENT_VERSION } from '@/shared/config/consent'

interface ConsentGateProps {
  children: ReactNode
}

export function ConsentGate({ children }: ConsentGateProps) {
  const locale = useLocale()
  const t = useTranslations('consent')
  const { user, isLoading: isAuthLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hasConsent, setHasConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [healthChecked, setHealthChecked] = useState(false)
  const [mlChecked, setMlChecked] = useState(false)

  const fetchConsent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/consent', { credentials: 'include' })
      if (!res.ok) {
        setHasConsent(false)
        return
      }
      const data = await res.json()
      setHasConsent(Boolean(data.hasRequiredConsents))
    } catch {
      setError(t('errors.checkFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      setHasConsent(true)
      setLoading(false)
      return
    }
    fetchConsent()
  }, [fetchConsent, isAuthLoading, user])

  const handleAccept = async () => {
    if (!healthChecked || !mlChecked) {
      setError(t('required'))
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentTypes: [...REQUIRED_CONSENT_TYPES],
          consentVersion: CURRENT_CONSENT_VERSION,
          locale,
        }),
      })
      if (!res.ok) {
        setError(t('errors.saveFailed'))
        return
      }
      const data = await res.json()
      setHasConsent(Boolean(data.hasRequiredConsents))
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    )
  }

  if (hasConsent) {
    return <>{children}</>
  }

  return (
    <>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-lg [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-health"
                checked={healthChecked}
                onCheckedChange={(v) => setHealthChecked(v === true)}
              />
              <Label htmlFor="consent-health" className="text-sm leading-relaxed cursor-pointer">
                {t('healthDataLabel')}
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-ml"
                checked={mlChecked}
                onCheckedChange={(v) => setMlChecked(v === true)}
              />
              <Label htmlFor="consent-ml" className="text-sm leading-relaxed cursor-pointer">
                {t('mlProcessingLabel')}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('privacyNote')}{' '}
              <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">
                {t('privacyLink')}
              </Link>
            </p>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              className="w-full rounded-2xl"
              onClick={handleAccept}
              disabled={submitting || !healthChecked || !mlChecked}
            >
              {submitting ? t('submitting') : t('accept')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="pointer-events-none opacity-30 blur-sm select-none" aria-hidden>
        {children}
      </div>
    </>
  )
}
