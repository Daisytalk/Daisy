import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { User } from '@/shared/types/auth'

export async function GET(request: NextRequest) {
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
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }})
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const onboardingData = await prisma.onboardingData.findUnique({
        where: { userId: user.id },
    });

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
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}