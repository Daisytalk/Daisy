'use client'

// FIX: Import ReactNode to correctly type children props.
import type { ReactNode } from 'react'
import { container, TOKENS } from '@/shared/lib/di'
import { GoogleAnalyticsService } from '@/shared/services/analytics'
import { StripePaymentService } from '@/shared/services/payment'
import { MailgunEmailService, MockEmailService } from '@/shared/services/email'
import { AIService } from '@/shared/services/ai'
import { AuthProvider } from '@/shared/hooks/useAuth'
import { env } from '@/shared/config/env'

const aiService = new AIService()

export function Providers({ children }: { children: ReactNode }) {
  // Initialize DI container with services
  // This is safe in a client component and runs before children render.
  const EmailService = env.NODE_ENV === 'development' && !env.MAILGUN_API_KEY
    ? MockEmailService
    : MailgunEmailService

  container
    .bindSingleton(TOKENS.ANALYTICS_SERVICE, GoogleAnalyticsService)
    .bindSingleton(TOKENS.PAYMENT_SERVICE, StripePaymentService)
    .bindSingleton(TOKENS.EMAIL_SERVICE, EmailService)
    .bindSingleton(TOKENS.AI_SERVICE, aiService)

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}