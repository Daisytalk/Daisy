'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { PricingSection } from '@/widgets/pricing'
import type { PlanInfo } from '@/widgets/pricing/index.components'

export function PricingPageClient() {
  const router = useRouter()
  const locale = useLocale()
  const [paymentLoading, setPaymentLoading] = useState(false)

  const handleSelectPlan = async (plan: PlanInfo) => {
    const meRes = await fetch('/api/auth/me', { credentials: 'include' })
    if (!meRes.ok) {
      localStorage.setItem('pending_plan', JSON.stringify({
        id: plan.id,
        price: plan.price,
        durationMonths: plan.durationMonths,
        name: plan.name,
      }))
      router.push(`/${locale}/register`)
      return
    }

    setPaymentLoading(true)
    try {
      const response = await fetch('/api/payments/freedompay/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price * 100,
          currency: 'USD',
          description: `Daisy - ${plan.name}`,
          durationMonths: plan.durationMonths,
          returnUrl: `${window.location.origin}/${locale}/chat`,
        }),
      })

      const data = await response.json()

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        router.push(`/${locale}/chat`)
      }
    } catch (error) {
      console.error('Payment creation failed:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <PricingSection onSelectPlan={paymentLoading ? undefined : handleSelectPlan} hideHeader />
  )
}
