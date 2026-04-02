import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { defaultLocale } from '@/i18n'

type Period = '7d' | '14d' | '30d'

/**
 * GET /api/account/weekly-report?period=7d|14d|30d
 * Generates AI analysis for the given period. Uses CBT API native weekly_report endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const period = (request.nextUrl.searchParams.get('period') || '7d') as Period
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
    const cutoff = subDays(new Date(), days)

    const [snapshot, history, memoryItems, userRow] = await Promise.all([
      prisma.psychProfileSnapshot.findFirst({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stressRating.findMany({
        where: {
          userId: decoded.userId,
          source: 'daily_checkin',
          date: { gte: cutoff },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.memoryItem.findMany({
        where: {
          userId: decoded.userId,
          createdAt: { gte: cutoff },
        },
        select: { topic: true, summary: true },
      }),
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { locale: true },
      }),
    ])

    const aiLocale =
      userRow?.locale === 'ru' || userRow?.locale === 'en' ? userRow.locale : defaultLocale

    const checkins = history.map((r) => ({
      date: format(r.date, 'd MMM', { locale: ru }),
      emotion: r.emotion ?? undefined,
      stress: r.stress ?? undefined,
      energy: r.energy ?? undefined,
      support: r.support ?? undefined,
    }))
    const memoryTopics = [...new Set(memoryItems.map((m) => m.topic))].slice(0, 10)
    const profile = snapshot
      ? {
          ESI: snapshot.ESI ?? undefined,
          BSI: snapshot.BSI ?? undefined,
          SSI: snapshot.SSI ?? undefined,
          MRI: snapshot.MRI ?? undefined,
          riskLevel: snapshot.riskLevel ?? undefined,
        }
      : undefined

    let result: { summary: string; insights: string[]; recommendations: string[] }
    let fromAI = false
    try {
      result = await cbtApi.getWeeklyReport({
        user_id: decoded.userId,
        period_days: days,
        checkins,
        profile,
        memory_topics: memoryTopics,
        locale: aiLocale,
      })
      fromAI = true
    } catch (err) {
      console.error('Weekly report AI error:', err)
      result = {
        summary: history.length
          ? 'За этот период есть данные чек-инов. Продолжай отслеживать своё состояние 🤍'
          : 'Пройди чек-ин, чтобы получить персональный анализ.',
        insights: [],
        recommendations: [
          'Попробуй технику STOP при стрессе',
          'Добавь 15 минут прогулки',
          'Поговори с Daisy если станет тяжело',
        ],
      }
    }

    return NextResponse.json({
      period,
      summary: result.summary,
      insights: result.insights,
      recommendations: result.recommendations,
      topics: memoryTopics,
      fromAI, // true = ответ от ИИ, false = fallback (ошибка или недоступность API)
    })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
