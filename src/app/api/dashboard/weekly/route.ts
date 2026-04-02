import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { defaultLocale } from '@/i18n'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'

function toStructuredRecommendations(items: string[]): { title: string; description: string }[] {
  return items.map((text) => {
    const dot = text.indexOf('. ')
    const nl = text.indexOf('\n')
    const split = dot >= 0 && (nl < 0 || dot < nl) ? dot : nl >= 0 ? nl : -1
    if (split >= 0) {
      const title = text.slice(0, split).trim()
      const description = text.slice(split + (dot >= 0 ? 2 : 1)).trim() || text
      return { title: title.slice(0, 60), description }
    }
    return { title: text.slice(0, 50) || 'Рекомендация', description: text }
  })
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    if (!token) {
      token = request.cookies.get('auth_token')?.value
    }

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const now = new Date()
    const startOfWeek = subDays(now, 7)
    const dates = `${format(startOfWeek, 'd', { locale: ru })} - ${format(now, 'd MMMM', { locale: ru })}`

    const [memoryItems, stressRatings, snapshot, user] = await Promise.all([
      prisma.memoryItem.findMany({
        where: {
          userId: decoded.userId,
          createdAt: { gte: startOfWeek }
        },
        take: 20
      }),
      prisma.stressRating.findMany({
        where: { userId: decoded.userId, source: 'daily_checkin', date: { gte: startOfWeek } },
        orderBy: { date: 'asc' }
      }),
      prisma.psychProfileSnapshot.findFirst({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { name: true, locale: true },
      })
    ])

    const topicCounts = memoryItems.reduce((acc, item) => {
      acc[item.topic] = (acc[item.topic] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0])

    if (topics.length === 0) {
      topics.push('Работа и усталость', 'Отношения с близкими', 'Тревога о будущем')
    }

    const memoryTopics = [...new Set(memoryItems.map((m) => m.topic))].slice(0, 10)
    const checkins = stressRatings.map((r) => ({
      date: format(r.date, 'd MMM', { locale: ru }),
      emotion: r.emotion != null ? normalizeScoreTo100(r.emotion) : undefined,
      stress: r.stress != null ? normalizeScoreTo100(r.stress) : undefined,
      energy: r.energy != null ? normalizeScoreTo100(r.energy) : undefined,
      support: r.support != null ? normalizeScoreTo100(r.support) : undefined,
    }))
    const profile = snapshot
      ? {
          ESI: snapshot.ESI ?? undefined,
          BSI: snapshot.BSI ?? undefined,
          SSI: snapshot.SSI ?? undefined,
          MRI: snapshot.MRI ?? undefined,
          riskLevel: snapshot.riskLevel ?? undefined,
        }
      : undefined

    const aiLocale =
      user?.locale === 'ru' || user?.locale === 'en' ? user.locale : defaultLocale

    let summary: string
    let topicsInsight: string
    let recommendations: { title: string; description: string }[]

    try {
      const ai = await cbtApi.getWeeklyReport({
        user_id: decoded.userId,
        period_days: 7,
        checkins,
        profile,
        memory_topics: memoryTopics,
        locale: aiLocale,
      })
      summary = ai.summary
      topicsInsight = ai.insights?.length ? ai.insights.join(' ') : ''
      recommendations = toStructuredRecommendations(ai.recommendations || [])
    } catch (err) {
      console.error('Weekly report AI error:', err)
      summary = stressRatings.length
        ? 'За эту неделю есть данные чек-инов. Продолжай отслеживать своё состояние 🤍'
        : 'Пройди чек-ин, чтобы получить персональный анализ.'
      topicsInsight = ''
      recommendations = toStructuredRecommendations([
        'Попробуй технику STOP при стрессе',
        'Добавь 15 минут прогулки',
        'Поговори с Daisy, если станет тяжело',
      ])
    }

    let chart: { day: string; value: number }[]
    if (stressRatings.length >= 7) {
      chart = stressRatings.map((s) => ({
        day: format(s.date, 'eee', { locale: ru }),
        value: normalizeScoreTo100(s.emotion),
      }))
    } else {
      chart = [
        { day: 'пн', value: 30 },
        { day: 'вт', value: 50 },
        { day: 'ср', value: 80 },
        { day: 'чт', value: 64 },
        { day: 'пт', value: 70 },
        { day: 'сб', value: 84 },
        { day: 'вс', value: 90 },
      ]
    }

    const chartWithValues = chart.map(c => ({ ...c, value: c.value }))
    const minEntry = chartWithValues.reduce((a, b) => (a.value <= b.value ? a : b))
    const maxEntry = chartWithValues.reduce((a, b) => (a.value >= b.value ? a : b))
    const userName = user?.name?.split(' ')[0] || null

    return NextResponse.json({
      weekDates: dates,
      summary,
      backgroundTheme: 'heavy',
      chart: chartWithValues,
      lightestDay: maxEntry.day,
      heaviestDay: minEntry.day,
      userName,
      topics,
      topicsInsight,
      recommendations,
    })
  } catch (error) {
    console.error('Weekly report api error', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
