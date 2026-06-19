'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

interface PremiumOffer {
  triggerType: string
  title: string
  description: string
  cta: string
}

export function PremiumBanner() {
  const locale = useLocale()
  const t = useTranslations('premiumBanner')
  const [offer, setOffer] = useState<PremiumOffer | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const checkOffer = useCallback(async () => {
    try {
      const r = await fetch('/api/premium/offer', { credentials: 'include' })
      if (!r.ok) return
      const data = await r.json()
      if (data.offer) setOffer(data.offer)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(checkOffer, 2000)
    return () => clearTimeout(timer)
  }, [checkOffer, dismissed])

  const handleDismiss = async () => {
    setDismissed(true)
    await fetch('/api/premium/dismiss', {
      method: 'POST',
      credentials: 'include',
    })
  }

  if (!offer || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mx-4 mb-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{offer.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Link
              href={`/${locale}/pricing`}
              className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {offer.cta}
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('notNow')}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
          aria-label={t('closeAria')}
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
