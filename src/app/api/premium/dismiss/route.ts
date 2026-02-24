import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const last = await prisma.premiumOfferLog.findFirst({
      where: { userId: decoded.userId },
      orderBy: { offerShownAt: 'desc' },
    })
    if (last) {
      await prisma.premiumOfferLog.update({
        where: { id: last.id },
        data: { dismissed: true },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Premium dismiss error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
