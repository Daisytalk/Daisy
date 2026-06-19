'use client'

import { useEffect, useRef } from 'react'

const IDLE_MS = 15 * 60 * 1000

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const

/**
 * Redirects or runs callback after 15 minutes without user activity.
 */
export function useSessionIdleTimeout(onIdle: () => void, enabled = true) {
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let timer: ReturnType<typeof setTimeout>

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => onIdleRef.current(), IDLE_MS)
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, reset, { passive: true })
    }
    reset()

    return () => {
      clearTimeout(timer)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, reset)
      }
    }
  }, [enabled])
}
