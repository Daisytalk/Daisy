import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { rateLimit } from '@/shared/lib/rate-limit'
import { getClientIP } from '@/shared/lib/get-client-ip'

const DUMMY_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYbwBRhC5ZO'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed, retryAfterMs } = rateLimit(`login:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { message: 'Слишком много попыток. Попробуйте позже.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return NextResponse.json(
      { message: apiMessages.serverConfigurationError },
      { status: 500 }
    )
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: apiMessages.emailPasswordRequired },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: apiMessages.invalidEmailOrPassword },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        deactivatedAt: true,
        subscriptionStatus: true,
      },
    })

    const isValidPassword = await AuthService.comparePassword(
      password,
      user?.password ?? DUMMY_HASH
    )

    if (!user || !isValidPassword) {
      return NextResponse.json(
        { message: apiMessages.invalidEmailOrPassword },
        { status: 401 }
      )
    }

    // Деактивированный аккаунт: > 30 дней — удаляем, иначе — requiresRestore
    if (user.deactivatedAt) {
      const daysSince = (Date.now() - user.deactivatedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince > 30) {
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json(
          { message: 'Аккаунт был безвозвратно удалён после 30 дней деактивации' },
          { status: 410 }
        )
      }
      // В течение 30 дней — выдаём токен и флаг для восстановления
    }

    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: user.id },
    })

    const isOnboarded = onboardingData?.completed ?? false

    const subscriptionStatus = (user.subscriptionStatus ?? 'trial') as 'trial' | 'active' | 'cancelled' | 'expired'

    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      isOnboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscriptionStatus,
      trialEndsAt: null,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isOnboarded,
        subscriptionStatus,
        trialEndsAt: null,
      },
      token,
      requiresRestore: !!user.deactivatedAt,
    })

    // Set HttpOnly cookie (secure: true для HTTPS; учитываем прокси Azure)
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isSecure = process.env.NODE_ENV === 'production' || forwardedProto === 'https' || request.nextUrl.protocol === 'https:'
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: apiMessages.somethingWentWrong },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}