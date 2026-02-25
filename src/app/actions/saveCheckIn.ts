'use server'

import prisma from '@/shared/lib/database'
import { getCurrentUserId } from '@/shared/lib/server-auth'
import { revalidatePath } from 'next/cache'

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existing = await prisma.stressRating.findFirst({
    where: {
      userId,
      source: 'daily_checkin',
      date: { gte: today, lt: tomorrow },
    },
  })
  if (existing) return { ok: false, error: 'Check-in already exists for today' }

  await prisma.stressRating.create({
    data: {
      userId,
      source: 'daily_checkin',
      date: today,
      emotion,
      stress,
      energy,
      support,
    },
  })

  revalidatePath('/[locale]/profile', 'page')
  revalidatePath('/ru/profile', 'page')
  revalidatePath('/en/profile', 'page')

  return { ok: true }
}
