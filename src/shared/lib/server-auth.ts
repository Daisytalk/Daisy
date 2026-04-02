import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { AuthService } from './auth'

/**
 * Проверяет JWT из cookie и из Authorization (Bearer).
 * Если cookie устарела, а Bearer валиден — используем Bearer (иначе submit онбординга
 * падал с «Недействительный токен», когда cookie переживала refresh в localStorage).
 */
export function getVerifiedAuthFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get('auth_token')?.value ?? null
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null

  if (cookieToken) {
    const decoded = AuthService.verifyToken(cookieToken)
    if (decoded) return decoded
  }
  if (bearerToken) {
    return AuthService.verifyToken(bearerToken)
  }
  return null
}

/** Returns current userId from auth cookie. For Server Components and Server Actions. */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  const decoded = AuthService.verifyToken(token)
  return decoded?.userId ?? null
}
