import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/shared/lib/database'

/**
 * POST /api/auth/forgot-password
 *
 * Генерирует токен сброса пароля и «отправляет» письмо.
 * Сейчас email-сервис не подключён — токен логируется в console.
 * После подключения (SendGrid / Resend / Nodemailer) заменить console.log
 * на реальную отправку письма.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email обязателен' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Неверный формат email' },
        { status: 400 }
      )
    }

    // Всегда возвращаем 200, чтобы не раскрывать, существует ли email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user) {
      // Не раскрываем, что пользователя нет
      return NextResponse.json({
        message: 'Если аккаунт с таким email существует, мы отправили инструкции по сбросу пароля.',
      })
    }

    // Не сбрасываем пароль для OAuth-only пользователей (пароль пустой)
    if (!user.password) {
      return NextResponse.json({
        message: 'Если аккаунт с таким email существует, мы отправили инструкции по сбросу пароля.',
      })
    }

    // Генерируем криптографически безопасный токен
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 час

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    })

    // Формируем ссылку сброса (NEXT_PUBLIC_APP_URL — приоритет, т.к. origin может быть localhost в Azure)
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'
    const resetUrl = `${origin}/ru/reset-password?token=${resetToken}`

    // ===== ЗАГЛУШКА: логируем вместо отправки письма =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 СБРОС ПАРОЛЯ (заглушка email)')
    console.log(`   Пользователь: ${user.name || user.email}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Ссылка: ${resetUrl}`)
    console.log(`   Действует до: ${resetExpires.toISOString()}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    // ====================================================

    return NextResponse.json({
      message: 'Если аккаунт с таким email существует, мы отправили инструкции по сбросу пароля.',
      // DEV ONLY: в проде убрать. Для удобства тестирования.
      ...(process.env.NODE_ENV !== 'production' && { _dev_resetUrl: resetUrl }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
