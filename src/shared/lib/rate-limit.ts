import { LRUCache } from 'lru-cache'

type Entry = { count: number; resetAt: number }

const cache = new LRUCache<string, Entry>({ max: 10_000 })

type RedisClient = {
  incrby(key: string, increment: number): Promise<number>
  pexpire(key: string, ms: number): Promise<number>
  pttl(key: string): Promise<number>
}

let redisClient: RedisClient | null | undefined

async function getRedis(): Promise<RedisClient | null> {
  if (redisClient !== undefined) return redisClient
  const url = process.env.REDIS_URL
  if (!url) {
    redisClient = null
    return null
  }
  try {
    const { default: Redis } = await import('ioredis')
    redisClient = new Redis(url) as unknown as RedisClient
    return redisClient
  } catch {
    redisClient = null
    return null
  }
}

function rateLimitMemory(
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

async function rateLimitRedis(
  key: string,
  limit: number,
  windowMs: number,
  increment = 1
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const redis = await getRedis()
  if (!redis) return rateLimitMemory(key, limit, windowMs)

  const redisKey = `rl:${key}`
  const count = await redis.incrby(redisKey, increment)
  if (count === increment) {
    await redis.pexpire(redisKey, windowMs)
  }
  if (count > limit) {
    const ttl = await redis.pttl(redisKey)
    return { allowed: false, retryAfterMs: Math.max(ttl, 0) }
  }
  return { allowed: true, retryAfterMs: 0 }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  if (process.env.REDIS_URL) {
    return rateLimitRedis(key, limit, windowMs)
  }
  return rateLimitMemory(key, limit, windowMs)
}

const AUTH_ROUTE_LIMITS = {
  'reset-password': { limit: 5, windowMs: 900_000 },
  newsletter: { limit: 3, windowMs: 3_600_000 },
  'admin-login': { limit: 5, windowMs: 900_000 },
} as const

export type AuthRateLimitRoute = keyof typeof AUTH_ROUTE_LIMITS

export async function rateLimitAuth(
  route: AuthRateLimitRoute,
  ip: string
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const { limit, windowMs } = AUTH_ROUTE_LIMITS[route]
  return rateLimit(`auth:${route}:${ip}`, limit, windowMs)
}

function messageCost(text: string): number {
  const chars = text.length
  if (chars <= 500) return 1
  if (chars <= 2000) return 2
  if (chars <= 5000) return 4
  if (chars <= 10000) return 8
  return 12
}

export async function rateLimitAI(
  userId: string,
  message: string,
  budget = 40
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const cost = messageCost(message)
  const key = `ai_weighted:${userId}`

  if (process.env.REDIS_URL) {
    return rateLimitRedis(key, budget, 60_000, cost)
  }

  const now = Date.now()
  const entry = cache.get(key)

  if (!entry || now > entry.resetAt) {
    cache.set(key, { count: cost, resetAt: now + 60_000 })
    return { allowed: true, retryAfterMs: 0 }
  }
  if (entry.count + cost > budget) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }
  entry.count += cost
  return { allowed: true, retryAfterMs: 0 }
}
