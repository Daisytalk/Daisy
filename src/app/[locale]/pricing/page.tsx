'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { PricingSection } from '@/widgets/pricing'
import type { PlanInfo } from '@/widgets/pricing/index.components'
import { AppLayout } from '@/shared/components/AppLayout'

export default function PricingPage() {
  const router = useRouter()
  const locale = useLocale()
  const [paymentLoading, setPaymentLoading] = useState(false)

  const handleSelectPlan = async (plan: PlanInfo) => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
    <AppLayout>
      <div className="min-h-screen bg-white pb-20">
        <PricingSection onSelectPlan={handleSelectPlan} />
      </div>
    </AppLayout>
  )
}
