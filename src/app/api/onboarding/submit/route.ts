import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { OnboardingAnswer } from '@/shared/types/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = AuthService.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { answers }: { answers: OnboardingAnswer[] } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: 'Answers array is required' },
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

    return NextResponse.json({ message: 'Onboarding completed successfully' })
  } catch (error) {
    console.error('Submit onboarding error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}