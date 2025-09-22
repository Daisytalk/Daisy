import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/features/newsletter-signup'
import { createApiResponse } from '@/shared/api/base'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        createApiResponse(null, 'Email is required'),
        { status: 400 }
      )
    }

    await subscribeToNewsletter(email)

    return NextResponse.json(
      createApiResponse({ message: 'Successfully subscribed to newsletter' })
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    return NextResponse.json(
      createApiResponse(null, 'Failed to subscribe to newsletter'),
      { status: 500 }
    )
  }
}