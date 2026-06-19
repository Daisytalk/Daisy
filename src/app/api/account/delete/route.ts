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

const DEACTIVATION_DAYS = 30

/**
 * DELETE /api/account/delete
 * Деактивация на 30 дней. Пользователь может восстановить до истечения срока.
 * После 30 дней аккаунт удаляется безвозвратно.
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    const userId = decoded.userId

    await AuthService.blacklistToken(token, userId)

    // Деактивация вместо удаления
    await prisma.user.update({
      where: { id: userId },
      data: { deactivatedAt: new Date() },
    })

    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth_token')
    return response
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', ctx: 'account_delete', message: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}
