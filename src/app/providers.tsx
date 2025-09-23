'use client'

import { useEffect } from 'react'
import { container, TOKENS } from '@/shared/lib/di'
import { GoogleAnalyticsService } from '@/shared/services/analytics'
import { StripePaymentService } from '@/shared/services/payment'
import { MailgunEmailService, MockEmailService } from '@/shared/services/email'
import { GeminiAIService, VertexAIService } from '@/shared/services/ai'
import { UserRepository } from '@/entities/user'
import { OnboardingRepository } from '@/entities/onboarding'
import { AuthProvider } from '@/shared/hooks/useAuth'
import { env } from '@/shared/config/env'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize DI container with services
    const EmailService = env.NODE_ENV === 'development' && !env.MAILGUN_API_KEY 
      ? MockEmailService 
      : MailgunEmailService

    container
      .bindSingleton(TOKENS.ANALYTICS_SERVICE, GoogleAnalyticsService)
      .bindSingleton(TOKENS.PAYMENT_SERVICE, StripePaymentService)
      .bindSingleton(TOKENS.EMAIL_SERVICE, EmailService)
      .bindSingleton(TOKENS.AI_SERVICE, GeminiAIService)
      .bindSingleton(TOKENS.VERTEX_AI_SERVICE, VertexAIService)
  }, [])

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}