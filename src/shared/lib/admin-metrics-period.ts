export type MetricsPreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'mtd'
  | 'ytd'
  | 'custom'

export type ResolvedMetricsPeriod = {
  preset: MetricsPreset
  /** null = весь срок (без нижней границы) */
  from: Date | null
  to: Date
  labelRu: string
}

export type ResolveMetricsPeriodResult =
  | { ok: true; period: ResolvedMetricsPeriod }
  | { ok: false; message: string }

function utcStartOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const day = Number(m[3])
  const dt = new Date(Date.UTC(y, mo, day))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== day) return null
  return dt
}

export function resolveMetricsPeriod(searchParams: URLSearchParams): ResolveMetricsPeriodResult {
  const raw = (searchParams.get('preset') || 'all') as MetricsPreset
  const allowed: MetricsPreset[] = [
    'all',
    'today',
    'yesterday',
    '7d',
    '30d',
    'mtd',
    'ytd',
    'custom',
  ]
  const preset = allowed.includes(raw) ? raw : 'all'

  const now = new Date()
  const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

  if (preset === 'custom') {
    const fromStr = searchParams.get('from') || ''
    const toStr = searchParams.get('to') || ''
    const fromD = parseYmd(fromStr)
    const toD = parseYmd(toStr)
    if (!fromD || !toD || fromD > toD) {
      return { ok: false, message: 'Укажите корректные from и to в формате YYYY-MM-DD' }
    }
    const toEnd = new Date(Date.UTC(toD.getUTCFullYear(), toD.getUTCMonth(), toD.getUTCDate(), 23, 59, 59, 999))
    const maxMs = 366 * 24 * 60 * 60 * 1000
    if (toEnd.getTime() - fromD.getTime() > maxMs) {
      return { ok: false, message: 'Период не должен превышать 366 дней' }
    }
    return {
      ok: true,
      period: {
        preset: 'custom',
        from: fromD,
        to: toEnd,
        labelRu: `${fmt.format(fromD)} — ${fmt.format(toD)}`,
      },
    }
  }

  if (preset === 'all') {
    return { ok: true, period: { preset: 'all', from: null, to: now, labelRu: 'Всё время' } }
  }

  if (preset === 'today') {
    const from = utcStartOfDay(now)
    return { ok: true, period: { preset: 'today', from, to: now, labelRu: `Сегодня (${fmt.format(from)})` } }
  }

  if (preset === 'yesterday') {
    const todayStart = utcStartOfDay(now)
    const yStart = new Date(todayStart)
    yStart.setUTCDate(yStart.getUTCDate() - 1)
    const yEnd = new Date(
      Date.UTC(yStart.getUTCFullYear(), yStart.getUTCMonth(), yStart.getUTCDate(), 23, 59, 59, 999)
    )
    return {
      ok: true,
      period: { preset: 'yesterday', from: yStart, to: yEnd, labelRu: `Вчера (${fmt.format(yStart)})` },
    }
  }

  if (preset === '7d') {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return { ok: true, period: { preset: '7d', from, to: now, labelRu: 'Последние 7 дней' } }
  }

  if (preset === '30d') {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { ok: true, period: { preset: '30d', from, to: now, labelRu: 'Последние 30 дней' } }
  }

  if (preset === 'mtd') {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(now)
    return {
      ok: true,
      period: { preset: 'mtd', from, to: now, labelRu: `С начала месяца (${monthName})` },
    }
  }

  if (preset === 'ytd') {
    const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    return {
      ok: true,
      period: { preset: 'ytd', from, to: now, labelRu: `С начала года (${now.getUTCFullYear()})` },
    }
  }

  return { ok: true, period: { preset: 'all', from: null, to: now, labelRu: 'Всё время' } }
}
