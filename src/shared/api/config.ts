import { env } from '@/shared/config/env'

export const API_CONFIG = {
  BASE_URL: env.AI_API_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const

/**
 * JSON headers for API requests. Auth is via the httpOnly `auth_token` cookie —
 * always pass `credentials: 'include'` on client-side fetch calls.
 */
export function getAuthHeaders(): Record<string, string> {
  return { ...API_CONFIG.HEADERS }
}
