'use client'

import { useState, useEffect, useRef } from 'react'

/** Reveals text character by character for a typewriter effect */
export function TypewriterText({
  text,
  speedMs = 12,
  onComplete,
  className,
  showCursor = true,
}: {
  text: string
  speedMs?: number
  onComplete?: () => void
  className?: string
  showCursor?: boolean
}) {
  const [visibleLength, setVisibleLength] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const isComplete = visibleLength >= text.length

  useEffect(() => {
    if (isComplete) {
      onCompleteRef.current?.()
      return
    }
    const t = setTimeout(() => setVisibleLength((n) => Math.min(n + 1, text.length)), speedMs)
    return () => clearTimeout(t)
  }, [text.length, visibleLength, speedMs, isComplete])

  useEffect(() => {
    setVisibleLength(0)
  }, [text])

  return (
    <span className={className}>
      {text.slice(0, visibleLength)}
      {showCursor && !isComplete && (
        <span className="inline-block w-0.5 h-4 align-middle bg-current animate-pulse ml-0.5" aria-hidden />
      )}
    </span>
  )
}
