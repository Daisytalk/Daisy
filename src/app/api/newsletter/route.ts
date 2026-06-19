import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { subscribeToNewsletter } from '@/features/newsletter-signup'
import { createApiResponse } from '@/shared/api/base'
import { apiMessages } from '@/shared/api-messages'
import { rateLimitAuth } from '@/shared/lib/rate-limit'
import { getClientIP } from '@/shared/lib/get-client-ip'
import { logger } from '@/shared/lib/safe-logger'

const emailSchema = z.object({
  email: z.string().trim().email().max(254),
})

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed, retryAfterMs } = await rateLimitAuth('newsletter', ip)
  if (!allowed) {
    return NextResponse.json(
      createApiResponse(null, 'Слишком много попыток. Попробуйте позже.'),
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const parsed = emailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(null, apiMessages.emailRequired),
        { status: 400 }
      )
    }

    await subscribeToNewsletter(parsed.data.email)

    return NextResponse.json(
      createApiResponse({ message: apiMessages.newsletterSubscribedSuccess })
    )
  } catch (error) {
    logger.error('newsletter_subscription_error', {
      message: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      createApiResponse(null, apiMessages.subscriptionFailed),
      { status: 500 }
    )
  }
}
