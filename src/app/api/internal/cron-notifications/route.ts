import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import { subDays } from 'date-fns'

/**
 * POST /api/internal/cron-notifications
 * Evaluates notification triggers for users. Called daily by Vercel Cron or Azure.
 * Protected by CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const sevenDaysAgo = subDays(now, 7)
  const threeDaysAgo = subDays(now, 3)
  const fourteenDaysAgo = subDays(now, 14)

  const snapshots = await prisma.psychProfileSnapshot.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    distinct: ['userId'],
    orderBy: { createdAt: 'desc' },
  })

  const notifications: Array<{ userId: string; trigger: string; text: string }> = []

  for (const { userId } of snapshots) {
    const snapshot = await prisma.psychProfileSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    if (!snapshot) continue

    const lastSession = await prisma.conversationState.findUnique({
      where: { userId },
    })
    const lastSessionAt = lastSession?.lastSessionAt
    const daysSinceSession = lastSessionAt
      ? Math.floor((now.getTime() - lastSessionAt.getTime()) / (24 * 60 * 60 * 1000))
      : 999

    const stressRatings = await prisma.stressRating.findMany({
      where: { userId, source: 'daily_checkin' },
      orderBy: { date: 'desc' },
      take: 5,
    })

    // P1: High-risk + first 7 days
    if (['high', 'critical'].includes(snapshot.riskLevel) && snapshot.createdAt >= sevenDaysAgo) {
      notifications.push({
        userId,
        trigger: 'P1',
        text: 'Мы здесь. Если сейчас тяжело — можно просто написать.',
      })
    }

    // P2: SSI <= 35 + 3 days without session
    if (snapshot.SSI <= 35 && daysSinceSession >= 3) {
      notifications.push({
        userId,
        trigger: 'P2',
        text: 'Похоже, сейчас непросто. Daisy рядом.',
      })
    }

    // P3: PVI <= 35 + 14-day pattern (simplified: just PVI low)
    if (snapshot.PVI <= 35) {
      notifications.push({
        userId,
        trigger: 'P3',
        text: 'Тело даёт сигналы. Давайте разберёмся вместе.',
      })
    }

    // P4: SSI <= 35
    if (snapshot.SSI <= 35) {
      notifications.push({
        userId,
        trigger: 'P4',
        text: 'Одиночество давит — это тяжело. Я здесь.',
      })
    }

    // P5: 2-3 days no activity + BSI >= 65
    if (daysSinceSession >= 2 && daysSinceSession <= 3 && snapshot.BSI >= 65) {
      notifications.push({
        userId,
        trigger: 'P5',
        text: 'Я замечаю, что в последнее время тебе было тяжело. Хочу проверить, как ты.',
      })
    }

    // ESI falling 3 days in a row (simplified: check last 3 stress ratings for emotion trend)
    if (stressRatings.length >= 3) {
      const emotions = stressRatings.slice(0, 3).map((r) => normalizeScoreTo100(r.emotion))
      const falling = emotions[0] < emotions[1] && emotions[1] < emotions[2]
      if (falling) {
        notifications.push({
          userId,
          trigger: 'ESI_fall',
          text: 'Похоже, последние дни были непростыми. Давайте замедлимся.',
        })
      }
    }
  }

  // In a real implementation, we would send push/email here.
  // For now we just log.
  console.log(
    JSON.stringify({
      level: 'info',
      ctx: 'cron_notifications',
      count: notifications.length,
      notifications: notifications.map((n) => ({ userId: n.userId, trigger: n.trigger })),
    })
  )

  return NextResponse.json({ processed: snapshots.length, notifications: notifications.length })
}
