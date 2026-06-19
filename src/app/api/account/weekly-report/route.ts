import { NextRequest, NextResponse } from 'next/server'
import type { Prisma, PrismaClient } from '@prisma/client'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { subDays, format, startOfDay } from 'date-fns'
import { ru as ruLocale } from 'date-fns/locale'
import { pickLocalizedStringArray, pickWeeklySummary } from '@/shared/lib/i18n-content'
import { pickLocaleFromRequest } from '@/shared/lib/locale-detection'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'

type Period = '7d' | '14d' | '30d'

/** Accelerate $extends loses some model delegates in TS; merge back for WeeklyReportSnapshot. */
type PrismaWithWeeklySnapshot = PrismaClient & {
  weeklyReportSnapshot: Prisma.WeeklyReportSnapshotDelegate
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/weekly-report?period=7d|14d|30d
 * Generates AI analysis for the given period. Uses CBT API native weekly_report endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const period = (request.nextUrl.searchParams.get('period') || '7d') as Period
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
    const cutoff = startOfDay(subDays(new Date(), days))

    const db = prisma as unknown as PrismaWithWeeklySnapshot

    const [seedSnapshot, memoryItems, userRow] = await Promise.all([
      db.weeklyReportSnapshot.findUnique({
        where: {
          userId_period: { userId: decoded.userId, period },
        },
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

    const uiLocale = pickLocaleFromRequest(request, userRow?.locale)

    if (seedSnapshot?.source === 'seed') {
      const memoryTopics = [...new Set<string>(memoryItems.map((m) => m.topic))].slice(0, 10)
      const insights = pickLocalizedStringArray(seedSnapshot.insights, uiLocale)
      const recommendations = pickLocalizedStringArray(seedSnapshot.recommendations, uiLocale)
      const summary = pickWeeklySummary(seedSnapshot.summary, seedSnapshot.summaryI18n, uiLocale)
      return NextResponse.json({
        period,
        summary,
        insights,
        recommendations,
        topics: memoryTopics,
        fromAI: false,
      })
    }

    const [snapshot, history] = await Promise.all([
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
    ])

    const checkins = history.map((r) => ({
      date: format(r.date, 'd MMM', { locale: ruLocale }),
      emotion: r.emotion != null ? normalizeScoreTo100(r.emotion) : undefined,
      stress: r.stress != null ? normalizeScoreTo100(r.stress) : undefined,
      energy: r.energy != null ? normalizeScoreTo100(r.energy) : undefined,
      support: r.support != null ? normalizeScoreTo100(r.support) : undefined,
    }))
    const memoryTopics = [...new Set<string>(memoryItems.map((m) => m.topic))].slice(0, 10)
    const profile = snapshot
      ? {
          ESI: snapshot.ESI ?? undefined,
          BSI: snapshot.BSI ?? undefined,
          SSI: snapshot.SSI ?? undefined,
          MRI: snapshot.MRI ?? undefined,
          riskLevel: snapshot.riskLevel ?? undefined,
        }
      : undefined

    const basePayload = {
      user_id: decoded.userId,
      period_days: days,
      checkins,
      profile,
      memory_topics: memoryTopics,
    }

    const [enSettled, ruSettled] = await Promise.allSettled([
      cbtApi.getWeeklyReport({ ...basePayload, locale: 'en' }),
      cbtApi.getWeeklyReport({ ...basePayload, locale: 'ru' }),
    ])

    let reportEn =
      enSettled.status === 'fulfilled'
        ? enSettled.value
        : null
    let reportRu =
      ruSettled.status === 'fulfilled'
        ? ruSettled.value
        : null

    if (enSettled.status === 'rejected') {
      console.error('Weekly report AI (en):', enSettled.reason)
    }
    if (ruSettled.status === 'rejected') {
      console.error('Weekly report AI (ru):', ruSettled.reason)
    }

    let fromAI = !!(reportEn && reportRu)
    if (!reportEn && reportRu) reportEn = reportRu
    if (!reportRu && reportEn) reportRu = reportEn

    const fallbackEn = {
      summary: history.length
        ? 'You have check-in data for this period. Keep tracking how you feel 🤍'
        : 'Do a check-in to get a personal analysis.',
      insights: [] as string[],
      recommendations: [
        'Try the STOP technique when stressed',
        'Add a 15-minute walk',
        'Talk to Daisy if it gets hard',
      ],
    }
    const fallbackRu = {
      summary: history.length
        ? 'За этот период есть данные чек-инов. Продолжай отслеживать своё состояние 🤍'
        : 'Пройди чек-ин, чтобы получить персональный анализ.',
      insights: [] as string[],
      recommendations: [
        'Попробуй технику STOP при стрессе',
        'Добавь 15 минут прогулки',
        'Поговори с Daisy если станет тяжело',
      ],
    }

    if (!reportEn || !reportRu) {
      fromAI = false
      if (!reportEn) reportEn = { ...fallbackEn }
      if (!reportRu) reportRu = { ...fallbackRu }
    }

    const summaryI18n = { en: reportEn.summary, ru: reportRu.summary }
    const insightsI18n = { en: reportEn.insights ?? [], ru: reportRu.insights ?? [] }
    const recommendationsI18n = { en: reportEn.recommendations, ru: reportRu.recommendations }
    const summaryColumn = uiLocale === 'ru' ? reportRu.summary : reportEn.summary

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
          summary: summaryColumn,
          summaryI18n,
          insights: insightsI18n,
          recommendations: recommendationsI18n,
          source: fromAI ? 'ai' : 'fallback',
          locale: uiLocale,
        },
        update: {
          summary: summaryColumn,
          summaryI18n,
          insights: insightsI18n,
          recommendations: recommendationsI18n,
          source: fromAI ? 'ai' : 'fallback',
          locale: uiLocale,
        },
      })
    } catch (persistErr) {
      console.error('Weekly report snapshot persist error:', persistErr)
    }

    const summary = pickWeeklySummary(summaryColumn, summaryI18n, uiLocale)
    const insightsOut = pickLocalizedStringArray(insightsI18n, uiLocale)
    const recommendationsOut = pickLocalizedStringArray(recommendationsI18n, uiLocale)

    return NextResponse.json({
      period,
      summary,
      insights: insightsOut,
      recommendations: recommendationsOut,
      topics: memoryTopics,
      fromAI,
    })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
