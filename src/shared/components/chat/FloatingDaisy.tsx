'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { DaisySVG } from './DaisySVG'
import { CheckInQuestions } from './CheckInQuestions'
import { saveCheckIn } from '@/app/actions/saveCheckIn'

const SHOWN_TODAY_KEY = 'daisy_shown_date'
const EVENING_START_HOUR = 18 // 18:00
const EVENING_END_HOUR = 22 // до 22:00

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isEvening() {
  const h = new Date().getHours()
  return h >= EVENING_START_HOUR && h < EVENING_END_HOUR
}

export function FloatingDaisy({ userName }: { userName: string }) {
  const t = useTranslations('profile.checkin')
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [done, setDone] = useState(false)
  const [hasCheckInToday, setHasCheckInToday] = useState(false)

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (hasCheckInToday || done) return
    if (!isEvening()) return

    const today = getTodayKey()
    const lastShown = typeof window !== 'undefined' ? localStorage.getItem(SHOWN_TODAY_KEY) : null
    if (lastShown === today) return

    const timer = setTimeout(() => {
      setVisible(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem(SHOWN_TODAY_KEY, today)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [hasCheckInToday, done])

  useEffect(() => {
    if (hasCheckInToday || done) return
    const today = getTodayKey()

    const id = setInterval(() => {
      if (!isEvening()) return
      const last = typeof window !== 'undefined' ? localStorage.getItem(SHOWN_TODAY_KEY) : null
      if (last === today) return
      setVisible(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem(SHOWN_TODAY_KEY, today)
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [hasCheckInToday, done])

  const handleDismiss = () => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHOWN_TODAY_KEY, getTodayKey())
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
            {t('question', { name: userName })}
          </p>
          <CheckInQuestions
            onComplete={async (answers) => {
              await saveCheckIn(answers)
              if (typeof window !== 'undefined') {
                localStorage.setItem(SHOWN_TODAY_KEY, getTodayKey())
              }
              setDone(true)
            }}
          />
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="animate-daisy-float hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer drop-shadow-xl"
          aria-label={t('ariaLabel')}
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
