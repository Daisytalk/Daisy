import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/features/newsletter-signup'
import { createApiResponse } from '@/shared/api/base'
import { apiMessages } from '@/shared/api-messages'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        createApiResponse(null, apiMessages.emailRequired),
        { status: 400 }
      )
    }

    await subscribeToNewsletter(email)

    return NextResponse.json(
      createApiResponse({ message: apiMessages.newsletterSubscribedSuccess })
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    return NextResponse.json(
      createApiResponse(null, apiMessages.subscriptionFailed),
      { status: 500 }
    )
  }
}