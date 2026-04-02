import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'admin_session'

/** Секрет подписи JWT админ-сессии (не путать с паролем входа). */
export function getAdminJwtSecret(): string | null {
  const s = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET
  if (!s || s.length < 16) return null
  return s
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null
}

export function verifyAdminSession(request: NextRequest): boolean {
  const secret = getAdminJwtSecret()
  if (!secret) return false
  const token = getAdminTokenFromRequest(request)
  if (!token) return false
  try {
    const p = jwt.verify(token, secret) as { admin?: boolean }
    return p.admin === true
  } catch {
    return false
  }
}

export function signAdminSessionToken(): string {
  const secret = getAdminJwtSecret()
  if (!secret) throw new Error('ADMIN_JWT_SECRET (или ADMIN_SECRET) не задан')
  return jwt.sign({ admin: true }, secret, { expiresIn: '7d' })
}
