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

    const decoded = AuthService.verifyToken(token)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: user.id },
    })

    const responseUser: User = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isOnboarded: onboardingData?.completed ?? false,
      subscriptionStatus: decoded.subscriptionStatus,
      trialEndsAt: decoded.trialEndsAt,
    }

    return NextResponse.json(responseUser)

  } catch (error) {
    console.error('Me endpoint error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Token has expired' },
          { status: 401 }
        )
      }
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { message: 'Invalid token' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}