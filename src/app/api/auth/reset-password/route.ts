import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { rateLimitAuth } from '@/shared/lib/rate-limit'
import { getClientIP } from '@/shared/lib/get-client-ip'
import { logger } from '@/shared/lib/safe-logger'

/**
 * POST /api/auth/reset-password
 *
 * Принимает токен сброса и новый пароль. Проверяет валидность токена,
 * хеширует новый пароль и обновляет запись пользователя.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed, retryAfterMs } = await rateLimitAuth('reset-password', ip)
  if (!allowed) {
    return NextResponse.json(
      { message: 'Слишком много попыток. Попробуйте позже.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Токен и новый пароль обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Пароль должен содержать не менее 8 символов' },
        { status: 400 }
      )
    }

    // Ищем пользователя с этим токеном и проверяем, что не истёк
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // токен ещё действителен
        },
      },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Ссылка для сброса пароля недействительна или истекла. Запросите новую.' },
        { status: 400 }
      )
    }

    // Хешируем новый пароль
    const hashedPassword = await AuthService.hashPassword(password)

    // Обновляем пароль и очищаем токен сброса
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })

    logger.info('password_reset_success', { userId: user.id })

    return NextResponse.json({
      message: 'Пароль успешно изменён. Теперь вы можете войти с новым паролем.',
    })
  } catch (error) {
    logger.error('reset_password_error', {
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
