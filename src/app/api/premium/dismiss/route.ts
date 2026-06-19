import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
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
