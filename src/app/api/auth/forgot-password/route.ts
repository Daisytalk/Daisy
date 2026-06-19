import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/shared/lib/database'
import { getEmailService } from '@/shared/services/email'
import { env } from '@/shared/config/env'
import { rateLimit } from '@/shared/lib/rate-limit'
import { getClientIP } from '@/shared/lib/get-client-ip'
import { defaultLocale } from '@/i18n'

/**
 * POST /api/auth/forgot-password
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed, retryAfterMs } = await rateLimit(`forgot:${ip}`, 3, 300_000)
  if (!allowed) {
    return NextResponse.json(
      { message: 'Слишком много попыток. Попробуйте позже.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  try {
    const { email, locale = 'ru' } = await request.json()

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

    const origin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'
    const safeLocale = typeof locale === 'string' && /^[a-z]{2}$/.test(locale) ? locale : defaultLocale
    const resetUrl = `${origin}/${safeLocale}/reset-password?token=${resetToken}`

    const subject = 'Daisy - сброс пароля'
    const text = `Здравствуйте${user.name ? `, ${user.name}` : ''}!\n\nВы запросили сброс пароля. Перейдите по ссылке (действует 1 час):\n\n${resetUrl}\n\nЕсли вы не запрашивали сброс, проигнорируйте это письмо.`
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.6;color:#333;"><p>Здравствуйте${user.name ? `, ${user.name}` : ''}!</p><p>Вы запросили сброс пароля. Нажмите на ссылку (действует 1 час):</p><p><a href="${resetUrl}" style="color:#0ea5e9;">Сбросить пароль</a></p><p>Или скопируйте в браузер:</p><p style="word-break:break-all;font-size:12px;">${resetUrl}</p><p>Если вы не запрашивали сброс, проигнорируйте это письмо.</p></body></html>`

    const mailer = getEmailService()
    try {
      await mailer.sendEmail({
        to: user.email,
        subject,
        text,
        html,
      })
    } catch (err) {
      console.error(JSON.stringify({ level: 'error', ctx: 'forgot_password_email_failed', userId: user.id, message: err instanceof Error ? err.message : String(err) }))
      return NextResponse.json(
        { message: 'Email сервис временно недоступен. Попробуйте позже.' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      message: 'Если аккаунт с таким email существует, мы отправили инструкции по сбросу пароля.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
