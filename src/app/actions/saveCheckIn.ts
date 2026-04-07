'use server'

import prisma from '@/shared/lib/database'
import { getCurrentUserId } from '@/shared/lib/server-auth'
import { revalidatePath } from 'next/cache'
import { routing } from '@/i18n/routing'

export type CheckInAnswers = {
  emotion: number
  stress: number
  energy: number
  support: number
}

export async function saveCheckIn(answers: CheckInAnswers): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUserId()
  if (!userId) return { ok: false, error: 'Unauthorized' }

  const { emotion, stress, energy, support } = answers
  const vals = [emotion, stress, energy, support]
  if (vals.some((v) => typeof v !== 'number' || v < 1 || v > 5)) {
    return { ok: false, error: 'All values must be 1-5' }
  }

  /** Calendar day in UTC — same anchor as getRollingWindowStartUtc / dynamics charts */
  const now = new Date()
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  const tomorrowUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  )

  const existing = await prisma.stressRating.findFirst({
    where: {
      userId,
      source: 'daily_checkin',
      date: { gte: todayUtc, lt: tomorrowUtc },
    },
  })
  if (existing) return { ok: false, error: 'Check-in already exists for today' }

  await prisma.stressRating.create({
    data: {
      userId,
      source: 'daily_checkin',
      date: todayUtc,
      emotion: emotion * 20,
      stress: stress * 20,
      energy: energy * 20,
      support: support * 20,
    },
  })

  for (const loc of routing.locales) {
    revalidatePath(`/${loc}/profile`, 'page')
    revalidatePath(`/${loc}/profile/dynamics`, 'page')
    revalidatePath(`/${loc}/dashboard`, 'page')
  }

  return { ok: true }
}
