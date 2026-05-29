import type { OnboardingAnswer } from '@/shared/types/auth'

/** Merge guest onboarding answers after login/OAuth (localStorage → API). */
export async function mergePendingOnboarding(authToken?: string | null): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const pending = localStorage.getItem('pending_onboarding')
  if (!pending) return false

  try {
    const answers = JSON.parse(pending) as OnboardingAnswer[]
    if (!Array.isArray(answers) || answers.length === 0) return false

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const res = await fetch('/api/onboarding/submit', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ answers }),
    })

    if (!res.ok) return false

    localStorage.removeItem('pending_onboarding')
    return true
  } catch {
    return false
  }
}
