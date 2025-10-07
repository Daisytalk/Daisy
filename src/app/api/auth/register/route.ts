import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, onboardingAnswers } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    const hashedPassword = await AuthService.hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Mark as onboarded if they completed onboarding before registration
        isOnboarded: !!onboardingAnswers && onboardingAnswers.length > 0,
      },
    })

    // Create corresponding onboarding data with answers if provided
    await prisma.onboardingData.create({
      data: {
        userId: newUser.id,
        responses: onboardingAnswers || {},
        completed: !!onboardingAnswers && onboardingAnswers.length > 0,
      }
    });

    await prisma.aiSession.create({
      data: {
        userId: newUser.id,
        messages: [],
        context: { persona: 'intake_specialist' }
      }
    })

    const trialEndsAt = AuthService.generateTrialEndDate();
    const isOnboarded = !!onboardingAnswers && onboardingAnswers.length > 0;
    
    const token = AuthService.generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name ?? undefined,
      isOnboarded,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      subscriptionStatus: 'trial',
      trialEndsAt,
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isOnboarded,
        subscriptionStatus: 'trial',
        trialEndsAt,
      },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
