import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { rating, helped, protocolType } = await request.json()
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })
    }

    await prisma.interventionFeedback.create({
      data: {
        userId: decoded.userId,
        rating,
        helped: typeof helped === 'boolean' ? helped : null,
        protocolType: typeof protocolType === 'string' ? protocolType : null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Intervention feedback error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
