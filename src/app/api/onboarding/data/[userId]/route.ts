import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import type { OnboardingData } from '@/shared/types/auth'

// Mock database for onboarding data (should be shared)
const onboardingData: OnboardingData[] = [
  // Pre-populated data for test user
  {
    userId: '1',
    answers: [
      { questionId: '1', answer: 'Male' },
      { questionId: '2', answer: '26-35' },
      { questionId: '3', answer: ['Anxiety and Stress', 'Work-Life Balance', 'Self-Esteem'] },
      { questionId: '4', answer: 6 },
      { questionId: '5', answer: true },
      { questionId: '6', answer: 'I want to work on managing stress from work and improving my confidence in social situations.' }
    ],
    completedAt: new Date('2024-01-10T10:30:00Z'),
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params

    // Check if user is requesting their own data or is admin
    if (decoded.userId !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized to access this data' },
        { status: 403 }
      )
    }

    // Find onboarding data for user
    const userData = onboardingData.find(data => data.userId === userId)
    
    if (!userData) {
      return NextResponse.json(
        { message: 'Onboarding data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Get onboarding data error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}