import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

type Period = '7d' | '14d' | '30d'

/**
 * GET /api/account/dynamics-insights?period=7d|14d|30d
 * Returns AI-generated insights per metric (emotion, stress, energy, support).
 * - With checkins: calls cbtApi.getDynamicsInsights() → Therapy-Multi-Agent
 * - Without checkins: returns static fallback prompts
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

    const history = await prisma.stressRating.findMany({
      where: {
        userId: decoded.userId,
        source: 'daily_checkin',
        date: { gte: cutoff },
      },
      orderBy: { date: 'asc' },
    })

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
      emotion: r.emotion ?? undefined,
      stress: r.stress ?? undefined,
      energy: r.energy ?? undefined,
      support: r.support ?? undefined,
    }))

    let result: { emotion: string; stress: string; energy: string; support: string }
    let fromAI = false
    try {
      result = await cbtApi.getDynamicsInsights({
        user_id: decoded.userId,
        period_days: days,
        checkins,
        locale: 'ru',
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
