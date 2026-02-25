'use client'

import { useState, useEffect } from 'react'
import { DaisySVG } from './DaisySVG'
import { CheckInQuestions } from './CheckInQuestions'
import { saveCheckIn } from '@/app/actions/saveCheckIn'

const DISMISS_KEY = 'daisy_dismissed'
const DISMISS_COOLDOWN_MS = 2 * 60 * 60 * 1000 // 2 hours

export function FloatingDaisy({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [done, setDone] = useState(false)
  const [hasCheckInToday, setHasCheckInToday] = useState(false)

  useEffect(() => {
    const lastDismissed = typeof window !== 'undefined' ? localStorage.getItem(DISMISS_KEY) : null
    const tooRecent = lastDismissed && Date.now() - Number(lastDismissed) < DISMISS_COOLDOWN_MS
    if (tooRecent) return

    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const check = async () => {
      try {
        const r = await fetch('/api/account/checkin-today', { credentials: 'include' })
        const d = await r.json()
        if (d.hasCheckIn) setHasCheckInToday(true)
      } catch {
        // ignore
      }
    }
    check()
  }, [visible])

  const handleDismiss = () => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
  }

  if (!visible || done || hasCheckInToday) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {expanded && (
        <div
          className="animate-daisy-enter bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-5 w-72 flex flex-col gap-4"
          style={{ animation: 'daisy-enter 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          <p className="text-sm font-medium text-gray-700 text-center">
            {userName}, как ты сейчас? 🤍
          </p>
          <CheckInQuestions
            onComplete={async (answers) => {
              await saveCheckIn(answers)
              setDone(true)
            }}
          />
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="animate-daisy-float hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer drop-shadow-xl"
          aria-label="Ежедневный чек-ин"
        >
          <DaisySVG size={expanded ? 56 : 72} />
        </button>
        {!expanded && (
          <button
            onClick={handleDismiss}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center hover:bg-gray-300"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
