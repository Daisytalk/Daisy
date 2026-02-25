import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

type Period = '7d' | '14d' | '30d'

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
      })
    }

    const historyText = history
      .map((r) => {
        const d = format(r.date, 'd MMM', { locale: ru })
        const parts = []
        if (r.emotion != null) parts.push(`эмоции: ${r.emotion}/5`)
        if (r.stress != null) parts.push(`стресс: ${r.stress}/5`)
        if (r.energy != null) parts.push(`энергия: ${r.energy}/5`)
        if (r.support != null) parts.push(`поддержка: ${r.support}/5`)
        return `${d}: ${parts.join(', ')}`
      })
      .join('\n')

    const prompt = `Ты Daisy — эмпатичный терапевтический ассистент. Проанализируй данные пользователя за ${days} дней и дай по одному короткому инсайту (1-2 предложения) для каждой метрики.

ЧЕК-ИНЫ (1-5, где 5 лучше):
${historyText}

Ответь СТРОГО в формате JSON:
{
  "emotion": "инсайт про эмоции",
  "stress": "инсайт про стресс",
  "energy": "инсайт про энергию",
  "support": "инсайт про поддержку"
}

Только JSON, без markdown и пояснений.`

    let aiResponse: { emotion?: string; stress?: string; energy?: string; support?: string }
    try {
      const res = await cbtApi.chat({
        text: prompt,
        user_id: decoded.userId,
        session_id: `dynamics-insights-${period}`,
      })
      const jsonMatch = res.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]) as typeof aiResponse
      } else {
        aiResponse = JSON.parse(res.response)
      }
    } catch (err) {
      console.error('Dynamics insights AI error:', err)
      aiResponse = {
        emotion: 'Эмоциональный фон меняется, продолжай наблюдать 🤍',
        stress: 'Обрати внимание на моменты, когда стресс повышается.',
        energy: 'Старайся давать себе отдых, когда энергия падает.',
        support: 'Ощущение поддержки важно, не забывай о близких.',
      }
    }

    return NextResponse.json({
      emotion: aiResponse.emotion || 'Эмоциональный фон меняется, продолжай наблюдать 🤍',
      stress: aiResponse.stress || 'Обрати внимание на моменты, когда стресс повышается.',
      energy: aiResponse.energy || 'Старайся давать себе отдых, когда энергия падает.',
      support: aiResponse.support || 'Ощущение поддержки важно, не забывай о близких.',
    })
  } catch (error) {
    console.error('Dynamics insights error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
