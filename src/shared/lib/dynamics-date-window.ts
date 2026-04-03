import { isValid, parseISO } from 'date-fns'

/** UTC midnight of the calendar day for `d` (stable across SSR/client and timezones). */
export function utcCalendarStartMs(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/**
 * Lower bound for rolling daily-check-in windows (UTC calendar days).
 * Matches Prisma `date: { gte }` when the same Date is used on the server.
 */
export function getRollingWindowStartUtc(rollingDays: number): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - rollingDays))
}

/** @deprecated Use getRollingWindowStartUtc — same implementation (UTC). */
export function getRollingWindowStart(rollingDays: number): Date {
  return getRollingWindowStartUtc(rollingDays)
}

export function toHistoryDate(d: Date | string): Date {
  if (d instanceof Date) return d
  const parsed = parseISO(typeof d === 'string' ? d : String(d))
  return isValid(parsed) ? parsed : new Date(d as string)
}

/** Rows whose UTC calendar day is on or after the rolling cutoff (same window as GET /api/dashboard/dynamics). */
export function filterHistoryByRollingDays<T extends { date: Date | string }>(
  history: T[],
  rollingDays: number
): T[] {
  const cutoffMs = getRollingWindowStartUtc(rollingDays).getTime()
  return history.filter((r) => {
    const d = toHistoryDate(r.date)
    if (!isValid(d)) return false
    return utcCalendarStartMs(d) >= cutoffMs
  })
}
