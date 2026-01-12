'use client'

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
import { CTASection } from '@/widgets/cta'
import { FooterSection } from '@/widgets/footer'
import { subscribeToNewsletter } from '@/features/newsletter-signup'
import { container, TOKENS } from '@/shared/lib/di'
import type { IAnalyticsService } from '@/shared/services/analytics'
import { ClientOnly } from '@/shared/components/ClientOnly'

function HomeContent() {
  const router = useRouter()
  const locale = useLocale()
  
  const handleGetStarted = () => {
    try {
      // Track analytics event
      const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
      analytics.track({
        action: 'click',
        category: 'cta',
        label: 'get_started',
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }

    // Navigate to onboarding with locale
    router.push(`/${locale}/onboarding`)
  }

  const handleLearnMore = () => {
    // Track analytics event
    const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
    analytics.track({
      action: 'click',
      category: 'cta',
      label: 'learn_more',
    })

    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectPlan = (planName: string) => {
    // Track analytics event
    const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
    analytics.track({
      action: 'select_plan',
      category: 'pricing',
      label: planName.toLowerCase(),
    })

    console.log(`Selected plan: ${planName}`)
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
