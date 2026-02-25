import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { startOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ hasCheckIn: false })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ hasCheckIn: false })

    const today = startOfDay(new Date())
    const record = await prisma.stressRating.findFirst({
      where: {
        userId: decoded.userId,
        source: 'daily_checkin',
        date: { gte: today },
      },
    })

    return NextResponse.json({ hasCheckIn: !!record })
  } catch {
    return NextResponse.json({ hasCheckIn: false })
  }
}
