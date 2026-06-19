import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { AuthService, type TokenPayload } from './auth'

export function extractAuthToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('auth_token')?.value ?? null
  if (cookieToken) return cookieToken
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }
  return null
}

/**
 * Validates JWT from cookie or Bearer: signature, blacklist, deactivated user.
 * Subscription/trial claims are refreshed from DB.
 */
export async function getVerifiedAuthFromRequest(
  request: NextRequest,
  opts?: { allowDeactivated?: boolean }
): Promise<TokenPayload | null> {
  const token = extractAuthToken(request)
  if (!token) return null
  return AuthService.validateSession(token, opts)
}

/** Returns current userId from auth cookie. For Server Components and Server Actions. */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  const decoded = await AuthService.validateSession(token)
  return decoded?.userId ?? null
}
