import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { subDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

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

    // Build realistic mock/semi-real data for the presentation
    const now = new Date()
    const startOfWeek = subDays(now, 7)
    const dates = `${format(startOfWeek, 'd', { locale: ru })} - ${format(now, 'd MMMM', { locale: ru })}`

    // Fetch memory items to find topics
    const memoryItems = await prisma.memoryItem.findMany({
      where: {
        userId: decoded.userId,
        createdAt: { gte: startOfWeek }
      },
      take: 20
    })

    const topicCounts = memoryItems.reduce((acc, item) => {
      acc[item.topic] = (acc[item.topic] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Sort and get top 4 topics
    const topics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0])

    if (topics.length === 0) {
      topics.push('Работа и усталость', 'Отношения с близкими', 'Тревога о будущем')
    }

    // Chart data based on recent check-ins
    let chart = []
    const stressRatings = await prisma.stressRating.findMany({
      where: { userId: decoded.userId, source: 'daily_checkin', date: { gte: startOfWeek } },
      orderBy: { date: 'asc' }
    })

    if (stressRatings.length >= 7) {
      chart = stressRatings.map(s => ({
        day: format(s.date, 'eee', { locale: ru }),
        value: s.emotion || 3
      }))
    } else {
      // Mock wave
      chart = [
        { day: 'пн', value: 1.5, lightest: false, heaviest: true },
        { day: 'вт', value: 2.5, lightest: false, heaviest: false },
        { day: 'ср', value: 4.0, lightest: true, heaviest: false },
        { day: 'чт', value: 3.2, lightest: false, heaviest: false },
        { day: 'пт', value: 3.5, lightest: false, heaviest: false },
        { day: 'сб', value: 4.2, lightest: false, heaviest: false },
        { day: 'вс', value: 4.5, lightest: false, heaviest: false },
      ]
    }

    return NextResponse.json({
      weekDates: dates,
      summary: 'Эта неделя была непростой, но ты была рядом с собой 🤍',
      backgroundTheme: 'heavy', // heavy | medium | good
      chart,
      topics,
      recommendations: [
        { title: 'Работа → усталость', description: 'Попробуй в конце рабочего дня делать один ритуал остановки. Просто сказать себе: "Рабочий день окончен."' },
        { title: 'Тревога о будущем', description: 'Когда тревожные мысли накрывают — просто запиши их. Не чтобы решить, а чтобы вынуть из головы.' },
        { title: 'Больше времени для себя', description: 'На этой неделе ты почти не была наедине с собой без задач. Найди 10 минут только для себя.' }
      ]
    })
  } catch (error) {
    console.error('Weekly report api error', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
