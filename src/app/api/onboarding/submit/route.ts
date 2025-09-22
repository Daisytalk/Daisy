import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import type { OnboardingAnswer, OnboardingData } from '@/shared/types/auth'

// Mock database for onboarding data
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

// Mock users database (should be shared with auth routes)
const users = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
    isOnboarded: true,
    subscriptionStatus: 'trial' as const,
    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
    isOnboarded: true,
    subscriptionStatus: 'active' as const,
    trialEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

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

    // Store onboarding data
    const data: OnboardingData = {
      userId: decoded.userId,
      answers,
      completedAt: new Date(),
    }

    onboardingData.push(data)

    // Update user's onboarded status
    const userIndex = users.findIndex(u => u.id === decoded.userId)
    if (userIndex !== -1) {
      users[userIndex].isOnboarded = true
      users[userIndex].updatedAt = new Date()
    }

    // Here you would typically send the onboarding data to your AI model
    // For now, we'll just log it
    console.log('Onboarding data for AI model:', {
      userId: decoded.userId,
      answers: answers,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ message: 'Onboarding completed successfully' })
  } catch (error) {
    console.error('Submit onboarding error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}