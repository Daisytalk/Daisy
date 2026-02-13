import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { OnboardingData, OnboardingAnswer } from '@/shared/types/auth'
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
      return NextResponse.json(
        { message: apiMessages.onboardingDataNotFound },
        { status: 404 }
      )
    }

    // Format the response to match the OnboardingData type expected by the frontend
    const responseData: OnboardingData = {
      userId: dbData.userId,
      // FIX: Cast to 'unknown' first to resolve the type error.
      // Prisma's JSON type is generic, but we know the structure from the submit endpoint.
      answers: dbData.responses as unknown as OnboardingAnswer[],
      completedAt: dbData.updatedAt, // Use updatedAt as a substitute for completedAt
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