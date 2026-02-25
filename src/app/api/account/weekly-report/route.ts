import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'
import { subDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

type Period = '7d' | '14d' | '30d'

/**
 * GET /api/account/weekly-report?period=7d|14d|30d
 * Generates AI analysis for the given period. Uses CBT API to produce
 * summary, insights, and recommendations.
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

    const [snapshot, history, memoryItems] = await Promise.all([
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
    ])

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

    const topics = [...new Set(memoryItems.map((m) => m.topic))].slice(0, 10).join(', ')

    const prompt = `Ты Daisy — эмпатичный терапевтический ассистент. Проанализируй данные пользователя и дай краткий отчёт.

ПЕРИОД: последние ${days} дней

ПРОФИЛЬ (если есть): ESI=${snapshot?.ESI ?? '—'}, BSI=${snapshot?.BSI ?? '—'}, SSI=${snapshot?.SSI ?? '—'}, MRI=${snapshot?.MRI ?? '—'}, риск=${snapshot?.riskLevel ?? '—'}

ЧЕК-ИНЫ (1-5, где 5 лучше):
${historyText || 'Нет данных за период'}

ТЕМЫ РАЗГОВОРОВ: ${topics || 'Нет данных'}

Ответь СТРОГО в формате JSON:
{
  "summary": "Один абзац общий вывод о периоде (2-3 предложения)",
  "insights": ["инсайт 1", "инсайт 2", "инсайт 3"],
  "recommendations": ["рекомендация 1", "рекомендация 2", "рекомендация 3"]
}

Только JSON, без markdown и пояснений.`

    let aiResponse: { summary?: string; insights?: string[]; recommendations?: string[] }
    try {
      const res = await cbtApi.chat({
        text: prompt,
        user_id: decoded.userId,
        session_id: `weekly-report-${period}`,
      })
      const jsonMatch = res.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]) as typeof aiResponse
      } else {
        aiResponse = {
          summary: res.response.slice(0, 300),
          insights: [],
          recommendations: [],
        }
      }
    } catch (err) {
      console.error('Weekly report AI error:', err)
      aiResponse = {
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
      summary: aiResponse.summary ?? '',
      insights: aiResponse.insights ?? [],
      recommendations: aiResponse.recommendations ?? [],
      topics: topics ? topics.split(', ') : [],
    })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
