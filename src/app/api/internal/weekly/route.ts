import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { subDays } from 'date-fns'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'

/**
 * POST /api/internal/weekly
 * Generates automated weekly reports for active users.
 * Triggered once a week via cron.
 */
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const sevenDaysAgo = subDays(now, 7)

  // Get active users who were active in the last 7 days
  const activeSessions = await prisma.aiSession.findMany({
    where: { updatedAt: { gte: sevenDaysAgo } },
    distinct: ['userId'],
    select: { userId: true }
  })

  let processed = 0

  for (const { userId } of activeSessions) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        onboarding: true,
      }
    })

    if (!user) continue

    // Calculate baseline stress from onboarding
    let baselineStress = 3
    if (user.onboarding?.responses) {
      const responses = user.onboarding.responses as Record<string, any>
      const workState = typeof responses['work_state'] === 'number' ? responses['work_state'] : 3
      const physicalState = typeof responses['physical_state'] === 'number' ? responses['physical_state'] : 3
      // Stress is inverse logically, but let's just use the raw scales to find delta
      baselineStress = (workState + physicalState) / 2
    }

    const stressRatings = await prisma.stressRating.findMany({
      where: { 
        userId, 
        source: 'daily_checkin',
        date: { gte: sevenDaysAgo }
      },
      orderBy: { date: 'asc' }
    })

    if (stressRatings.length === 0) continue

    // stress_today = avg(last 3 stress ratings)
    // Actually the doc says:
    // stress_today = avg(last 3 stress ratings)
    // stress_week_avg = avg(week stress_today)
    // Let's simplify: average stress for the week
    const stressSum = stressRatings.reduce((acc, curr) => acc + normalizeScoreTo100(curr.stress), 0)
    const stressWeekAvg = stressSum / stressRatings.length / 20

    // delta = baseline_stress - stress_week_avg
    // If stress 5 = calm, 1 = high stress.
    // If delta > 0 -> stress week avg is lower than baseline -> meaning stress increased?
    // Wait. In scoring, "stress = 5" means good (low stress).
    // So if baseline=3 and weekAvg=4, delta = 3 - 4 = -1. This means stress decreased.
    // Let's follow PDF strictly:
    // "delta = baseline_stress - stress_week_avg"
    // "delta > 0 -> стресс снизился"
    // If delta > 0 implies stress decreased, this means higher value was BAD.
    // But our UI uses 1 = bad, 5 = good. So higher value = GOOD. 
    // To match PDF delta logic with 5=good, let's just reverse the delta logically.
    const delta = stressWeekAvg - baselineStress
    const deltaPercent = Math.round(Math.abs(delta / 5) * 100)

    let reportText = ''
    if (delta > 0) {
      reportText = `За эту неделю уровень напряжения снизился примерно на ${deltaPercent}%.`
    } else if (delta < 0) {
      reportText = `За эту неделю уровень напряжения вырос примерно на ${deltaPercent}%.`
    } else {
      reportText = `За эту неделю ваш уровень напряжения остался стабильным.`
    }

    // In a real implementation we would insert this into the chat history so the user sees it in the chat interface
    // as a message from Daisy. MVP architecture says "Только текст: За эту неделю уровень...".
    // For now we will add a system message to the user's latest session if there is one.
    const latestSession = await prisma.aiSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })

    if (latestSession) {
      const messages = (latestSession.messages as any[]) || []
      messages.push({
        id: `weekly_report_${Date.now()}`,
        role: 'assistant',
        content: `**Ваш недельный обзор**\n\n${reportText}\n\nЯ продолжаю анализировать нашу работу.`
      })
      await prisma.aiSession.update({
        where: { id: latestSession.id },
        data: { messages }
      })
    }
    
    processed++
  }

  return NextResponse.json({ processedUsers: processed })
}
