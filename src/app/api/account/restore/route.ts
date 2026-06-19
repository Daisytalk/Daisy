import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

/**
 * POST /api/account/restore
 * Восстановление деактивированного аккаунта (в течение 30 дней)
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request, { allowDeactivated: true })
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
    console.error(JSON.stringify({ level: 'error', ctx: 'account_restore', message: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}
