import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'

function getToken(request: NextRequest): string | null {
  const cookie = request.cookies.get('auth_token')?.value
  if (cookie) return cookie
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7)
  return null
}

/**
 * DELETE /api/account/delete
 * GDPR: полное удаление аккаунта и всех связанных данных
 * Cascade в Prisma удалит: OnboardingData, AiSession, CbtConversation (+ CbtMessage)
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    const userId = decoded.userId

    // Blacklist token (если таблица используется при проверке)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await prisma.tokenBlacklist.upsert({
      where: { token },
      create: { token, userId, expiresAt },
      update: { expiresAt },
    }).catch(() => {
      // Игнорируем, если таблица не настроена или дубликат
    })

    // Удаление пользователя — cascade удалит связанные данные
    await prisma.user.delete({
      where: { id: userId },
    })

    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth_token')
    return response
  } catch (error) {
    console.error('Account delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
