import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    if (!token) {
      token = request.cookies.get('auth_token')?.value
    }

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Fetch the last 7 daily checkins
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const ratings = await prisma.stressRating.findMany({
      where: {
        userId: decoded.userId,
        source: 'daily_checkin',
        date: { gte: sevenDaysAgo }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('Dynamics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
