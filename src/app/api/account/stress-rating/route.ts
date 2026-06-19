import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/shared/lib/database'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { routing } from '@/i18n/routing'

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { rating, source, emotion, stress, energy, support } = await request.json()
    const isDailyCheckin = source === 'daily_checkin'
    if (isDailyCheckin) {
      const vals = [emotion, stress, energy, support]
      if (vals.some((v) => typeof v !== 'number' || v < 1 || v > 5)) {
        return NextResponse.json({ error: 'emotion, stress, energy, support must be 1-5' }, { status: 400 })
      }
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const existing = await prisma.stressRating.findFirst({
        where: {
          userId: decoded.userId,
          source: 'daily_checkin',
          date: { gte: today, lt: tomorrow },
        },
      })
      if (existing) {
        return NextResponse.json({ error: 'Check-in already exists for today' }, { status: 409 })
      }

      await prisma.stressRating.create({
        data: {
          userId: decoded.userId,
          source: 'daily_checkin',
          date: today,
          emotion,
          stress,
          energy,
          support,
        },
      })

      for (const loc of routing.locales) {
        revalidatePath(`/${loc}/profile`, 'page')
        revalidatePath(`/${loc}/dashboard`, 'page')
      }
    } else {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })
      }
      await prisma.stressRating.create({
        data: { userId: decoded.userId, rating, source: source ?? 'post_session' },
      })
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { currentStressRating: rating },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Stress rating error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
