import { NextRequest, NextResponse } from 'next/server'
import type { Prisma, PrismaClient } from '@prisma/client'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format, startOfDay } from 'date-fns'
import { ru as ruLocale } from 'date-fns/locale'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'
import { pickMetricInsightsFromDb } from '@/shared/lib/i18n-content'
import { pickLocaleFromCookieOrUser } from '@/shared/lib/locale-detection'

type Period = '7d' | '14d' | '30d'

type PrismaWithWeeklySnapshot = PrismaClient & {
  weeklyReportSnapshot: Prisma.WeeklyReportSnapshotDelegate
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/dynamics-insights?period=7d|14d|30d
 * Если в weekly_report_snapshots.dynamics_metric_insights есть JSON — отдаём его (источник БД).
 * Иначе при наличии чек-инов — AI; иначе статичные подсказки.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const period = (request.nextUrl.searchParams.get('period') || '7d') as Period
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
    const cutoff = startOfDay(subDays(new Date(), days))

    const db = prisma as unknown as PrismaWithWeeklySnapshot

    const [history, userRow, snapshotRow] = await Promise.all([
      prisma.stressRating.findMany({
        where: {
          userId: decoded.userId,
          source: 'daily_checkin',
          date: { gte: cutoff },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { locale: true },
      }),
      db.weeklyReportSnapshot.findUnique({
        where: {
          userId_period: { userId: decoded.userId, period },
        },
        select: { dynamicsMetricInsights: true },
      }),
    ])

    const uiLocale = pickLocaleFromCookieOrUser(request, userRow?.locale)

    const fromDb = pickMetricInsightsFromDb(snapshotRow?.dynamicsMetricInsights, uiLocale)
    if (fromDb) {
      return NextResponse.json({
        ...fromDb,
        fromAI: false,
        fromDb: true,
      })
    }

    if (!history.length) {
      return NextResponse.json({
        emotion: 'Пройди чек-ин, чтобы получить инсайт об эмоциях 🤍',
        stress: 'Пройди чек-ин, чтобы получить инсайт о стрессе 🤍',
        energy: 'Пройди чек-ин, чтобы получить инсайт об энергии 🤍',
        support: 'Пройди чек-ин, чтобы получить инсайт о поддержке 🤍',
        fromAI: false,
      })
    }

    const checkins = history.map((r) => ({
      date: format(r.date, 'd MMM', { locale: ruLocale }),
      emotion: r.emotion != null ? normalizeScoreTo100(r.emotion) : undefined,
      stress: r.stress != null ? normalizeScoreTo100(r.stress) : undefined,
      energy: r.energy != null ? normalizeScoreTo100(r.energy) : undefined,
      support: r.support != null ? normalizeScoreTo100(r.support) : undefined,
    }))

    const basePayload = {
      user_id: decoded.userId,
      period_days: days,
      checkins,
    }

    const [enSettled, ruSettled] = await Promise.allSettled([
      cbtApi.getDynamicsInsights({ ...basePayload, locale: 'en' }),
      cbtApi.getDynamicsInsights({ ...basePayload, locale: 'ru' }),
    ])

    let insightsEn =
      enSettled.status === 'fulfilled'
        ? enSettled.value
        : null
    let insightsRu =
      ruSettled.status === 'fulfilled'
        ? ruSettled.value
        : null

    if (enSettled.status === 'rejected') {
      console.error('Dynamics insights AI (en):', enSettled.reason)
    }
    if (ruSettled.status === 'rejected') {
      console.error('Dynamics insights AI (ru):', ruSettled.reason)
    }

    let fromAI = !!(insightsEn && insightsRu)
    if (!insightsEn && insightsRu) insightsEn = insightsRu
    if (!insightsRu && insightsEn) insightsRu = insightsEn

    const fallback = {
      emotion: 'Эмоциональный фон меняется, продолжай наблюдать 🤍',
      stress: 'Обрати внимание на моменты, когда стресс повышается.',
      energy: 'Старайся давать себе отдых, когда энергия падает.',
      support: 'Ощущение поддержки важно, не забывай о близких.',
    }

    if (!insightsEn || !insightsRu) {
      fromAI = false
      insightsEn = { ...fallback }
      insightsRu = { ...fallback }
    }

    const dynamicsMetricInsights = { en: insightsEn, ru: insightsRu }

    try {
      await db.weeklyReportSnapshot.upsert({
        where: {
          userId_period: {
            userId: decoded.userId,
            period,
          },
        },
        create: {
          userId: decoded.userId,
          period,
          summary: '—',
          summaryI18n: { en: '—', ru: '—' },
          insights: { en: [], ru: [] },
          recommendations: { en: [], ru: [] },
          dynamicsMetricInsights,
          source: 'ai',
          locale: uiLocale,
        },
        update: {
          dynamicsMetricInsights,
        },
      })
    } catch (persistErr) {
      console.error('Dynamics insights persist error:', persistErr)
    }

    const result = uiLocale === 'ru' ? insightsRu! : insightsEn!

    return NextResponse.json({ ...result, fromAI })
  } catch (error) {
    console.error('Dynamics insights error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
