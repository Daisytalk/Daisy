import type { OnboardingAnswer } from '@/shared/types/auth'

/** Merge guest onboarding answers after login/OAuth (localStorage → API). */
export async function mergePendingOnboarding(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const pending = localStorage.getItem('pending_onboarding')
  if (!pending) return false

  try {
    const answers = JSON.parse(pending) as OnboardingAnswer[]
    if (!Array.isArray(answers) || answers.length === 0) return false

    const res = await fetch('/api/onboarding/submit', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })

    if (!res.ok) return false

    localStorage.removeItem('pending_onboarding')
    return true
  } catch {
    return false
  }
}
