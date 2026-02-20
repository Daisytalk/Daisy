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
 * POST /api/account/restore
 * Восстановление деактивированного аккаунта (в течение 30 дней)
 */
export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, deactivatedAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.deactivatedAt) {
      return NextResponse.json({ success: true, message: 'Account is already active' })
    }

    const daysSinceDeactivation = (Date.now() - user.deactivatedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceDeactivation > 30) {
      await prisma.user.delete({ where: { id: user.id } })
      return NextResponse.json(
        { error: 'Account was permanently deleted after 30 days of deactivation' },
        { status: 410 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { deactivatedAt: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account restore error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
