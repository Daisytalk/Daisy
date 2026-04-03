import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { filterHistoryByRollingDays, getRollingWindowStartUtc, toHistoryDate } from './dynamics-date-window'

describe('dynamics-date-window', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-03T12:00:00.000Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('getRollingWindowStartUtc(7) is UTC midnight 7 calendar days before today UTC', () => {
    expect(getRollingWindowStartUtc(7).toISOString()).toBe('2026-03-27T00:00:00.000Z')
  })

  it('filterHistoryByRollingDays uses UTC calendar days (ISO strings)', () => {
    const rows = [
      { date: '2026-03-26T23:59:59.999Z', id: 'before' },
      { date: '2026-03-27T00:00:00.000Z', id: 'on' },
      { date: '2026-04-03T22:00:00.000Z', id: 'last' },
    ]
    const out = filterHistoryByRollingDays(rows, 7)
    expect(out.map((r) => r.id)).toEqual(['on', 'last'])
    expect(toHistoryDate(rows[0].date).getUTCDate()).toBe(26)
  })
})
