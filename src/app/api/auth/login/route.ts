import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

const DUMMY_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYbwBRhC5ZO'

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })

    const isValidPassword = await AuthService.comparePassword(
      password,
      user?.password ?? DUMMY_HASH
    )

    if (!user || !isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: user.id },
    })

    const isOnboarded = onboardingData?.completed ?? false

    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      isOnboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscriptionStatus: 'active',
      trialEndsAt: null,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isOnboarded,
        subscriptionStatus: 'active',
        trialEndsAt: null,
      },
      token, // Still return token for backwards compatibility
    })

    // Set HttpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}