import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/shared/lib/database'
import { getEmailService } from '@/shared/services/email'
import { env } from '@/shared/config/env'

/**
 * POST /api/auth/forgot-password
 *
 * Генерирует токен сброса пароля и отправляет письмо со ссылкой (Mailgun).
 * Если Mailgun не настроен — ссылка логируется в console (для разработки).
 */
export async function POST(request: NextRequest) {
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
    const safeLocale = typeof locale === 'string' && /^[a-z]{2}$/.test(locale) ? locale : 'ru'
    const resetUrl = `${origin}/${safeLocale}/reset-password?token=${resetToken}`

    const subject = 'Daisy — сброс пароля'
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
      console.error('Forgot password: failed to send email', err)
      return NextResponse.json(
        { message: 'Не удалось отправить письмо. Попробуйте позже или обратитесь в поддержку.' },
        { status: 500 }
      )
    }
    if (!env.AZURE_COMMUNICATION_CONNECTION_STRING && !env.MAILGUN_API_KEY) {
      console.log('📧 СБРОС ПАРОЛЯ (email не настроен — ссылка в логах):', resetUrl)
    }

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
