import { startOfDay, subDays } from 'date-fns'
import { isValid, parseISO } from 'date-fns'

/** Lower bound for rolling daily-check-in windows (matches GET /api/dashboard/dynamics for rollingDays=7). */
export function getRollingWindowStart(rollingDays: number): Date {
  return startOfDay(subDays(new Date(), rollingDays))
}

export function toHistoryDate(d: Date | string): Date {
  if (d instanceof Date) return d
  const parsed = parseISO(typeof d === 'string' ? d : String(d))
  return isValid(parsed) ? parsed : new Date(d as string)
}

/** Rows with calendar day in [startOfDay(now − rollingDays), today], inclusive. */
export function filterHistoryByRollingDays<T extends { date: Date | string }>(
  history: T[],
  rollingDays: number
): T[] {
  const cutoff = getRollingWindowStart(rollingDays)
  return history.filter((r) => startOfDay(toHistoryDate(r.date)) >= cutoff)
}
