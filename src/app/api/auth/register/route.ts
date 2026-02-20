import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { computePsychProfile } from '@/shared/lib/scoring'

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return NextResponse.json(
      { message: apiMessages.serverConfigurationError },
      { status: 500 }
    )
  }

  try {
    const { name, email, password, onboardingAnswers } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: apiMessages.nameEmailPasswordRequired },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: apiMessages.nameMinLength },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: apiMessages.invalidEmailFormat },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: apiMessages.passwordMinLength },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: apiMessages.userAlreadyExists },
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

      // Save communication_style to aiProfile if present
      const styles = Array.isArray((onboardingAnswers as Record<string, unknown>)?.communication_style)
        ? (onboardingAnswers as Record<string, unknown>).communication_style as string[]
        : []
      if (styles.length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { aiProfile: { communication_style: styles } },
        })
      }

      // Scoring: create psych profile snapshot from onboarding answers
      if (isOnboarded && onboardingAnswers && Object.keys(onboardingAnswers).length > 0) {
        const profile = computePsychProfile(onboardingAnswers)
        await tx.psychProfileSnapshot.create({
          data: {
            userId: user.id,
            ESI: profile.ESI,
            BSI: profile.BSI,
            SSI: profile.SSI,
            PVI: profile.PVI,
            MRI: profile.MRI,
            riskLevel: profile.riskLevel,
            cluster: profile.cluster ?? null,
            flags: profile.flags ?? undefined,
          },
        })
      }

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

    // Set HttpOnly cookie (secure: true для HTTPS; учитываем прокси Azure)
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isSecure = process.env.NODE_ENV === 'production' || forwardedProto === 'https' || request.nextUrl.protocol === 'https:'
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: isSecure,
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
          { message: apiMessages.userAlreadyExists },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { message: apiMessages.internalServerError },
      { status: 500 }
    )
  }
}