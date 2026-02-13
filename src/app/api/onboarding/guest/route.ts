import { NextRequest, NextResponse } from 'next/server'
import type { OnboardingAnswer } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'

/**
 * API endpoint for guest (unauthenticated) users to save onboarding data
 * This stores the data temporarily and returns a session ID
 * The data will be associated with the user account upon registration
 */
export async function POST(request: NextRequest) {
  try {
    const { answers }: { answers: OnboardingAnswer[] } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: apiMessages.answersArrayRequired },
        { status: 400 }
      )
    }

    // Validate that we have at least some answers
    if (answers.length === 0) {
      return NextResponse.json(
        { message: apiMessages.atLeastOneAnswerRequired },
        { status: 400 }
      )
    }

    // Generate a temporary session ID for tracking
    const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // In a production environment, you might want to:
    // 1. Store this in a temporary database table with expiration
    // 2. Use Redis for temporary storage
    // 3. Encrypt the data before storing
    
    // For now, we'll return the session ID and let the client store it
    // The client will pass this data to the registration endpoint
    
    return NextResponse.json({ 
      message: apiMessages.onboardingDataReceivedSuccess,
      sessionId,
      success: true
    })
  } catch (error) {
    console.error('Guest onboarding error:', error)
    return NextResponse.json(
      { message: apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
