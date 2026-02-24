import { redactPII } from '@/shared/lib/pii/redactor'

const REDACTED_KEYS = new Set([
  'email', 'password', 'token', 'reseturl', 'resettoken',
  'phone', 'secret', 'key', 'authorization', 'accesstoken',
])

function sanitizeValue(key: string, value: unknown): unknown {
  if (REDACTED_KEYS.has(key.toLowerCase())) return '[REDACTED]'
  if (typeof value === 'string') return redactPII(value).redacted
  return value
}

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  if (process.env.NODE_ENV !== 'production') return data
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, sanitizeValue(k, v)])
  )
}

export const logger = {
  info: (ctx: string, data: Record<string, unknown> = {}) =>
    console.log(JSON.stringify({ level: 'info', ctx, ...sanitize(data) })),
  warn: (ctx: string, data: Record<string, unknown> = {}) =>
    console.warn(JSON.stringify({ level: 'warn', ctx, ...sanitize(data) })),
  error: (ctx: string, data: Record<string, unknown> = {}) =>
    console.error(JSON.stringify({ level: 'error', ctx, ...sanitize(data) })),
}
