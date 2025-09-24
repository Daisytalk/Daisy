import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await AuthService.comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: user.id },
    });

    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      isOnboarded: onboardingData?.completed ?? false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscriptionStatus: 'active', // This would be determined by your subscription logic
      trialEndsAt: null,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isOnboarded: onboardingData?.completed ?? false,
        // These fields would be determined by your subscription logic
        subscriptionStatus: 'active',
        trialEndsAt: null,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
