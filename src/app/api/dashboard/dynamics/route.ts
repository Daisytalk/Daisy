import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { getRollingWindowStartUtc } from '@/shared/lib/dynamics-date-window'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const sevenDaysAgo = getRollingWindowStartUtc(7)

    const ratings = await prisma.stressRating.findMany({
      where: {
        userId: decoded.userId,
        source: 'daily_checkin',
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('Dynamics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
