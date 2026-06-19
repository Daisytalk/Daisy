'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { HeroSection } from '@/widgets/hero'
import { BenefitsSection } from '@/widgets/benefits'
import { ChatDemoSection } from '@/widgets/chat-demo'
import { HelpTopicsSection } from '@/widgets/help-topics'
import { NeuroplasticitySection } from '@/widgets/neuroplasticity'
import { ScienceSection } from '@/widgets/science'
import { FAQSection } from '@/widgets/faq'
import { PricingSection } from '@/widgets/pricing'
import type { PlanInfo } from '@/widgets/pricing/index.components'
import { CTASection } from '@/widgets/cta'
import { FooterSection } from '@/widgets/footer'
import { subscribeToNewsletter } from '@/features/newsletter-signup'
import { container, TOKENS } from '@/shared/lib/di'
import type { IAnalyticsService } from '@/shared/services/analytics'
import { ClientOnly } from '@/shared/components/ClientOnly'

function HomeContent() {
  const router = useRouter()
  const locale = useLocale()
  const [paymentLoading, setPaymentLoading] = useState(false)
  
  const handleGetStarted = () => {
    try {
      const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
      analytics.track({
        action: 'click',
        category: 'cta',
        label: 'get_started',
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }

    router.push(`/${locale}/onboarding`)
  }

  const handleLearnMore = () => {
    const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
    analytics.track({
      action: 'click',
      category: 'cta',
      label: 'learn_more',
    })

    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectPlan = async (plan: PlanInfo) => {
    try {
      const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
      analytics.track({
        action: 'select_plan',
        category: 'pricing',
        label: plan.id,
      })
    } catch { /* analytics optional */ }

    // Проверяем авторизацию
    const meRes = await fetch('/api/auth/me', { credentials: 'include' })
    if (!meRes.ok) {
      // Сохраняем выбранный план и перенаправляем на регистрацию
      localStorage.setItem('pending_plan', JSON.stringify({
        id: plan.id,
        price: plan.price,
        durationMonths: plan.durationMonths,
        name: plan.name,
      }))
      router.push(`/${locale}/register`)
      return
    }

    // Создаём платёж через Freedom Pay stub API
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
          amount: plan.price * 100, // в центах
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
        // Stub: нет редиректа — переходим в чат
        console.log('Payment stub created:', data)
        router.push(`/${locale}/chat`)
      }
    } catch (error) {
      console.error('Payment creation failed:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleNewsletterSubmit = async (email: string) => {
    try {
      await subscribeToNewsletter(email)

      // Track analytics event
      const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
      analytics.track({
        action: 'subscribe',
        category: 'newsletter',
        label: 'footer_signup',
      })
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
      throw error
    }
  }

  return (
    <main className="min-h-screen">
      <HeroSection
        onGetStarted={handleGetStarted}
        onLearnMore={handleLearnMore}
      />
      <BenefitsSection />
      <HelpTopicsSection />
      <NeuroplasticitySection />
      <ScienceSection />
      <ChatDemoSection />
      <FAQSection />
      <PricingSection onSelectPlan={handleSelectPlan} />
      <CTASection onGetStarted={handleGetStarted} />
      <FooterSection onNewsletterSubmit={handleNewsletterSubmit} />
    </main>
  )
}

export default function HomePage() {
  return (
    <ClientOnly>
      <HomeContent />
    </ClientOnly>
  )
}
