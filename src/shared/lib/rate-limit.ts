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
