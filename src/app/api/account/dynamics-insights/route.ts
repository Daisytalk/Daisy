import { NextRequest, NextResponse } from 'next/server'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { defaultLocale } from '@/i18n'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'

type Period = '7d' | '14d' | '30d'

type PrismaWithWeeklySnapshot = PrismaClient & {
  weeklyReportSnapshot: Prisma.WeeklyReportSnapshotDelegate
}

function parseDynamicsMetricInsightsJson(
  raw: unknown
): { emotion: string; stress: string; energy: string; support: string } | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  if (
    typeof o.emotion === 'string' &&
    typeof o.stress === 'string' &&
    typeof o.energy === 'string' &&
    typeof o.support === 'string'
  ) {
    return { emotion: o.emotion, stress: o.stress, energy: o.energy, support: o.support }
  }
  return null
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

    const fromDb = parseDynamicsMetricInsightsJson(snapshotRow?.dynamicsMetricInsights)
    if (fromDb) {
      return NextResponse.json({
        ...fromDb,
        fromAI: false,
        fromDb: true,
      })
    }

    const aiLocale =
      userRow?.locale === 'ru' || userRow?.locale === 'en' ? userRow.locale : defaultLocale

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
      date: format(r.date, 'd MMM', { locale: ru }),
      emotion: r.emotion != null ? normalizeScoreTo100(r.emotion) : undefined,
      stress: r.stress != null ? normalizeScoreTo100(r.stress) : undefined,
      energy: r.energy != null ? normalizeScoreTo100(r.energy) : undefined,
      support: r.support != null ? normalizeScoreTo100(r.support) : undefined,
    }))

    let result: { emotion: string; stress: string; energy: string; support: string }
    let fromAI = false
    try {
      result = await cbtApi.getDynamicsInsights({
        user_id: decoded.userId,
        period_days: days,
        checkins,
        locale: aiLocale,
      })
      fromAI = true
    } catch (err) {
      console.error('Dynamics insights AI error:', err)
      result = {
        emotion: 'Эмоциональный фон меняется, продолжай наблюдать 🤍',
        stress: 'Обрати внимание на моменты, когда стресс повышается.',
        energy: 'Старайся давать себе отдых, когда энергия падает.',
        support: 'Ощущение поддержки важно, не забывай о близких.',
      }
    }

    return NextResponse.json({ ...result, fromAI })
  } catch (error) {
    console.error('Dynamics insights error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
