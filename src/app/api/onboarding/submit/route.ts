import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { OnboardingAnswer } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'

export async function POST(request: NextRequest) {
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

    const { answers }: { answers: OnboardingAnswer[] } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: apiMessages.answersArrayRequired },
        { status: 400 }
      )
    }

    await prisma.onboardingData.update({
      where: {
        userId: decoded.userId,
      },
      data: {
        responses: answers,
        completed: true,
      }
    });

    return NextResponse.json({ message: apiMessages.onboardingCompletedSuccess })
  } catch (error) {
    console.error('Submit onboarding error:', error)
    return NextResponse.json(
      { message: apiMessages.internalServerError },
      { status: 500 }
    )
  }
}