import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const { name, email, password, onboardingAnswers } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    const hashedPassword = await AuthService.hashPassword(password)
    const isOnboarded = !!onboardingAnswers && Object.keys(onboardingAnswers).length > 0

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      })

      await tx.onboardingData.create({
        data: {
          userId: user.id,
          responses: onboardingAnswers || {},
          completed: isOnboarded,
        }
      })

      await tx.aiSession.create({
        data: {
          userId: user.id,
          messages: [],
          context: { persona: 'intake_specialist' }
        }
      })

      return user
    })

    const trialEndsAt = AuthService.generateTrialEndDate()
    
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

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isOnboarded,
        subscriptionStatus: 'trial',
        trialEndsAt,
      },
      token, // Still return token for backwards compatibility
    }, { status: 201 })

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
    console.error('Registration error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}