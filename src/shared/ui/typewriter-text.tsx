'use client'

import { useState, useEffect, useRef } from 'react'

/** Reveals text character by character for a typewriter effect */
export function TypewriterText({
  text,
  speedMs = 12,
  onComplete,
  onFirstChar,
  className,
  showCursor = true,
}: {
  text: string
  speedMs?: number
  onComplete?: () => void
  /** Called when the first character is shown (so thinking state can be cleared) */
  onFirstChar?: () => void
  className?: string
  showCursor?: boolean
}) {
  const [visibleLength, setVisibleLength] = useState(0)
  const onCompleteRef = useRef(onComplete)
  const onFirstCharRef = useRef(onFirstChar)
  const firstCharFiredRef = useRef(false)
  const isComplete = visibleLength >= text.length

  useEffect(() => {
    onCompleteRef.current = onComplete
    onFirstCharRef.current = onFirstChar
  }, [onComplete, onFirstChar])

  useEffect(() => {
    if (visibleLength >= 1 && text.length >= 1 && !firstCharFiredRef.current) {
      firstCharFiredRef.current = true
      onFirstCharRef.current?.()
    }
  }, [visibleLength, text.length])

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
    firstCharFiredRef.current = false
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
