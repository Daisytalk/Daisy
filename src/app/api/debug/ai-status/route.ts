import { NextResponse } from 'next/server'
import { cbtApi } from '@/shared/lib/cbt-api'
import { defaultLocale } from '@/i18n'

/**
 * GET /api/debug/ai-status
 * Проверяет, отвечает ли CBT API (weekly_report, dynamics_insights).
 * Только в development.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const results: { weeklyReport?: { ok: boolean; fromAI?: boolean; error?: string }; dynamicsInsights?: { ok: boolean; fromAI?: boolean; error?: string } } = {}

  // Test weekly_report
  try {
    const wr = await cbtApi.getWeeklyReport({
      user_id: 'debug-test',
      period_days: 7,
      checkins: [{ date: '1 янв', emotion: 4, stress: 2, energy: 4, support: 5 }],
      memory_topics: ['Тест'],
      locale: defaultLocale,
    })
    results.weeklyReport = {
      ok: true,
      fromAI: !!(wr?.summary && (wr?.recommendations?.length ?? 0) > 0),
    }
  } catch (err: unknown) {
    results.weeklyReport = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // Test dynamics_insights
  try {
    const di = await cbtApi.getDynamicsInsights({
      user_id: 'debug-test',
      period_days: 7,
      checkins: [{ date: '1 янв', emotion: 4, stress: 2, energy: 4, support: 5 }],
      locale: defaultLocale,
    })
    results.dynamicsInsights = {
      ok: true,
      fromAI: !!(di?.emotion && di?.stress),
    }
  } catch (err: unknown) {
    results.dynamicsInsights = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  return NextResponse.json({
    cbtApiUrl: process.env.CBT_API_URL ? '***' : 'NOT SET',
    results,
  })
}
