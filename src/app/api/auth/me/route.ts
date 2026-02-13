import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { User } from '@/shared/types/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return NextResponse.json(
      { message: 'Server configuration error' },
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
        { message: 'Authorization token required' },
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
          { message: 'Server configuration error' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = decoded?.userId ?? (decoded as { id?: string })?.id
    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    let user: { id: string; email: string; name: string | null; createdAt: Date; updatedAt: Date } | null = null
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })
    } catch (dbErr) {
      console.error('Me endpoint: database error', dbErr)
      return NextResponse.json(
        { message: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
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
        { message: 'Token has expired' },
        { status: 401 }
      )
    }
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}