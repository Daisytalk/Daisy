import { LRUCache } from 'lru-cache'

type Entry = { count: number; resetAt: number }

const cache = new LRUCache<string, Entry>({ max: 10_000 })

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = cache.get(key)

  if (!entry || now > entry.resetAt) {
    cache.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }
  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}

function messageCost(text: string): number {
  const chars = text.length
  if (chars <= 500) return 1
  if (chars <= 2000) return 2
  if (chars <= 5000) return 4
  if (chars <= 10000) return 8
  // Unreachable when HARD_MAX = 10_000 is enforced upstream.
  // Kept as a safety net in case HARD_MAX is raised in the future.
  return 12
}

export function rateLimitAI(
  userId: string,
  message: string,
  budget = 40
): { allowed: boolean; retryAfterMs: number } {
  const cost = messageCost(message)
  const BUDGET = budget
  const now = Date.now()
  const key = `ai_weighted:${userId}`
  const entry = cache.get(key)

  if (!entry || now > entry.resetAt) {
    cache.set(key, { count: cost, resetAt: now + 60_000 })
    return { allowed: true, retryAfterMs: 0 }
  }
  if (entry.count + cost > BUDGET) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }
  entry.count += cost
  return { allowed: true, retryAfterMs: 0 }
}
