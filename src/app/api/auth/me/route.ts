import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { User } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return NextResponse.json(
      { message: apiMessages.serverConfigurationError },
      { status: 500 }
    )
  }

  try {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = request.cookies.get('auth_token')?.value

    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json(
        { message: apiMessages.authorizationRequired },
        { status: 401 }
      )
    }

    let decoded: { userId?: string; subscriptionStatus?: string; trialEndsAt?: Date | null } | null = null
    try {
      decoded = AuthService.verifyToken(token)
    } catch (verifyErr) {
      const msg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr)
      console.error('Me endpoint: verifyToken threw', msg)
      if (msg.includes('JWT_SECRET')) {
        return NextResponse.json(
          { message: apiMessages.serverConfigurationError },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { message: apiMessages.invalidOrExpiredToken },
        { status: 401 }
      )
    }

    const userId = decoded?.userId ?? (decoded as { id?: string })?.id
    if (!userId) {
      return NextResponse.json(
        { message: apiMessages.invalidOrExpiredToken },
        { status: 401 }
      )
    }

    let user: { id: string; email: string; name: string | null; createdAt: Date; updatedAt: Date; deactivatedAt: Date | null } | null = null
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deactivatedAt: true,
        }
      })
    } catch (dbErr) {
      console.error('Me endpoint: database error', dbErr)
      return NextResponse.json(
        { message: apiMessages.serviceUnavailable },
        { status: 503 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { message: apiMessages.userNotFound },
        { status: 404 }
      )
    }

    if (user.deactivatedAt) {
      return NextResponse.json(
        { message: 'Account deactivated', requiresRestore: true },
        { status: 403 }
      )
    }

    let onboardingData: { completed: boolean } | null = null
    try {
      onboardingData = await prisma.onboardingData.findUnique({
        where: { userId: user.id },
        select: { completed: true },
      })
    } catch {
      // не критично — вернём isOnboarded: false
    }

    const responseUser: User = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isOnboarded: onboardingData?.completed ?? false,
      subscriptionStatus: (decoded?.subscriptionStatus as User['subscriptionStatus']) ?? 'trial',
      trialEndsAt: decoded?.trialEndsAt ?? null,
    }

    return NextResponse.json(responseUser)

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('Me endpoint error:', err.message, err.name, err.stack)

    if (err.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: apiMessages.tokenExpired },
        { status: 401 }
      )
    }
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: apiMessages.invalidToken },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: apiMessages.internalServerError },
      { status: 500 }
    )
  }
}