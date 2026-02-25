import { cookies } from 'next/headers'
import { AuthService } from './auth'

/** Returns current userId from auth cookie. For Server Components and Server Actions. */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  const decoded = AuthService.verifyToken(token)
  return decoded?.userId ?? null
}
