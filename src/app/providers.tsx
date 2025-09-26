'use client'

// FIX: Import ReactNode to correctly type children props.
import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { container, TOKENS } from '@/shared/lib/di'
import { GoogleAnalyticsService } from '@/shared/services/analytics'
import { StripePaymentService } from '@/shared/services/payment'
import { MailgunEmailService, MockEmailService } from '@/shared/services/email'
import { AIService } from '@/shared/services/ai'
import { AuthProvider } from '@/shared/hooks/useAuth'
import { env } from '@/shared/config/env'

// Initialize DI container with services.
// This runs once when the module is imported on the client,
// preventing re-initialization on every render.
if (typeof window !== 'undefined' && !container.has(TOKENS.AI_SERVICE)) {
  const aiService = new AIService()
  const EmailService = env.NODE_ENV === 'development' && !env.MAILGUN_API_KEY
    ? MockEmailService
    : MailgunEmailService

  container
    .bindSingleton(TOKENS.ANALYTICS_SERVICE, GoogleAnalyticsService)
    .bindSingleton(TOKENS.PAYMENT_SERVICE, StripePaymentService)
    .bindSingleton(TOKENS.EMAIL_SERVICE, EmailService)
    .bindSingleton(TOKENS.AI_SERVICE, aiService)
}

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Always render children but wrap AuthProvider conditionally
  return (
    <>
      {isClient ? (
        <AuthProvider>
          {children}
        </AuthProvider>
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      )}
    </>
  )
}
