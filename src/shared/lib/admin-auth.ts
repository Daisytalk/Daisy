import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'admin_session'

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null
}

export function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret || secret.length < 16) return false
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
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET is not set')
  return jwt.sign({ admin: true }, secret, { expiresIn: '7d' })
}
