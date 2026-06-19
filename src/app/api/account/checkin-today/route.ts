import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { startOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ hasCheckIn: false })

    const today = startOfDay(new Date())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const record = await prisma.stressRating.findFirst({
      where: {
        userId: decoded.userId,
        source: 'daily_checkin',
        date: { gte: today, lt: tomorrow },
      },
    })

    return NextResponse.json({ hasCheckIn: !!record })
  } catch {
    return NextResponse.json({ hasCheckIn: false })
  }
}
