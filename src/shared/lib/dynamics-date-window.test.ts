import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { filterHistoryByRollingDays, getRollingWindowStart, toHistoryDate } from './dynamics-date-window'
import { startOfDay, subDays } from 'date-fns'

describe('dynamics-date-window', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-03T12:00:00.000Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('getRollingWindowStart(7) matches startOfDay(subDays(now, 7))', () => {
    expect(getRollingWindowStart(7).getTime()).toBe(startOfDay(subDays(new Date(), 7)).getTime())
  })

  it('filterHistoryByRollingDays keeps rows on or after cutoff (ISO strings)', () => {
    const cutoff = startOfDay(subDays(new Date(), 7))
    const rows = [
      { date: '2026-03-26T10:00:00.000Z', id: 'before' },
      { date: '2026-03-27T08:00:00.000Z', id: 'on' },
      { date: '2026-04-03T22:00:00.000Z', id: 'last' },
    ]
    const out = filterHistoryByRollingDays(rows, 7)
    expect(out.map((r) => r.id)).toEqual(['on', 'last'])
    expect(startOfDay(toHistoryDate(rows[0].date)).getTime()).toBeLessThan(cutoff.getTime())
  })
})
