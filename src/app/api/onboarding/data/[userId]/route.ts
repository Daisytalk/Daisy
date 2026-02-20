import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { OnboardingData, OnboardingAnswer, OnboardingAnswerValue } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'

export async function GET(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: apiMessages.authorizationRequired },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = AuthService.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { message: apiMessages.invalidToken },
        { status: 401 }
      )
    }

    const { userId } = params

    // Check if user is requesting their own data or is admin
    if (decoded.userId !== userId) {
      return NextResponse.json(
        { message: apiMessages.unauthorizedToAccessData },
        { status: 403 }
      )
    }

    // Find onboarding data for user from the database
    const dbData = await prisma.onboardingData.findUnique({
      where: { userId },
    })
    
    if (!dbData) {
      // Return empty state so profile can show "not completed" rather than hiding section
      const emptyData: OnboardingData = {
        userId,
        answers: [],
        completedAt: null as unknown as Date,
      }
      return NextResponse.json(emptyData)
    }

    // Format: support both array [{questionId, answer}] and object {questionId: answer}
    let answers: OnboardingAnswer[]
    if (Array.isArray(dbData.responses)) {
      answers = dbData.responses as unknown as OnboardingAnswer[]
    } else if (dbData.responses && typeof dbData.responses === 'object' && !Array.isArray(dbData.responses)) {
      answers = Object.entries(dbData.responses as Record<string, unknown>).map(([questionId, answer]) => ({ questionId, answer: answer as OnboardingAnswerValue }))
    } else {
      answers = []
    }

    const responseData: OnboardingData = {
      userId: dbData.userId,
      answers,
      completedAt: dbData.completed ? dbData.updatedAt : null as unknown as Date,
    };

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Get onboarding data error:', error)
    return NextResponse.json(
      { message: apiMessages.internalServerError },
      { status: 500 }
    )
  }
}