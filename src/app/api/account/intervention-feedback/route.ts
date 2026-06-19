import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/shared/lib/database'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

const VALID_PROTOCOLS = ['stabilize', 'regulate', 'solve'] as const

const FeedbackSchema = z.object({
  protocolType: z.enum(VALID_PROTOCOLS),
  feltEasier: z.number().int().min(1).max(5),
  helped: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const parsed = FeedbackSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Недопустимые данные обратной связи' }, { status: 400 })
    }
    const { protocolType, feltEasier, helped } = parsed.data

    await prisma.interventionFeedback.create({
      data: {
        userId: decoded.userId,
        rating: feltEasier,
        helped,
        protocolType,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Intervention feedback error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
