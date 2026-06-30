'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ButterflyIcon } from './ButterflyIcon'
import { CheckInQuestions } from '@/shared/components/chat/CheckInQuestions'
import { saveCheckIn } from '@/app/actions/saveCheckIn'

const SHOWN_TODAY_KEY = 'daisy_shown_date'
const EVENING_START_HOUR = 18
/** Последний час окна (включительно): 18:00–22:59 */
const EVENING_LAST_HOUR = 22
/** Опрос чаще в вечернем окне, чтобы не ждать до минуты после 18:00 */
const TICK_MS = 15_000

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isEvening() {
  const h = new Date().getHours()
  return h >= EVENING_START_HOUR && h <= EVENING_LAST_HOUR
}

/** Мс до начала сегодняшнего вечернего окна (18:00). 0 если уже внутри или окно прошло сегодня. */
function msUntilEveningWindow(): number {
  const now = new Date()
  const start = new Date(now)
  start.setHours(EVENING_START_HOUR, 0, 0, 0)
  if (now < start) return start.getTime() - now.getTime()
  return 0
}

export function FloatingDaisy({ userName }: { userName: string }) {
  const t = useTranslations('profile.checkin')
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewFly =
    process.env.NODE_ENV === 'development' && searchParams.get('butterfly') === '1'
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [done, setDone] = useState(false)
  const [hasCheckInToday, setHasCheckInToday] = useState(false)
  const [checkinLoaded, setCheckinLoaded] = useState(false)

  const hasCheckInRef = useRef(false)
  const doneRef = useRef(false)
  useEffect(() => {
    hasCheckInRef.current = hasCheckInToday
  }, [hasCheckInToday])
  useEffect(() => {
    doneRef.current = done
  }, [done])

  useEffect(() => {
    if (previewFly) setVisible(true)
  }, [previewFly])

  useEffect(() => {
    if (previewFly) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/account/checkin-today', { credentials: 'include' })
        const d = await r.json()
        if (!cancelled && d.hasCheckIn) setHasCheckInToday(true)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCheckinLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [previewFly])

  const tryShow = useCallback(() => {
    if (previewFly) return
    if (typeof window === 'undefined') return
    if (hasCheckInRef.current || doneRef.current) return
    if (!isEvening()) return
    const today = getTodayKey()
    if (localStorage.getItem(SHOWN_TODAY_KEY) === today) return
    setVisible(true)
    localStorage.setItem(SHOWN_TODAY_KEY, today)
  }, [previewFly])

  useEffect(() => {
    if (previewFly) return
    if (!checkinLoaded) return
    if (hasCheckInToday || done) return

    tryShow()

    const interval = setInterval(tryShow, TICK_MS)

    let eveningTimeout: ReturnType<typeof setTimeout> | undefined
    const ms = msUntilEveningWindow()
    if (ms > 0) {
      eveningTimeout = setTimeout(() => {
        tryShow()
      }, ms)
    }

    return () => {
      clearInterval(interval)
      if (eveningTimeout !== undefined) clearTimeout(eveningTimeout)
    }
  }, [checkinLoaded, hasCheckInToday, done, tryShow, previewFly])

  const handleDismiss = () => {
    if (previewFly) {
      setVisible(false)
      return
    }
    setVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHOWN_TODAY_KEY, getTodayKey())
    }
  }

  if ((!visible || done || hasCheckInToday) && !previewFly) return null

  /** Пока панель открыта — ромашка стоит внизу справа, чтобы не «убегала» с текстом */
  const flyAcross = !expanded

  return (
    <div
      className={
        flyAcross
          ? 'fixed inset-0 z-50 pointer-events-none'
          : 'fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3'
      }
    >
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
              const result = await saveCheckIn(answers)
              if (result.ok) {
                router.refresh()
                if (typeof window !== 'undefined') {
                  localStorage.setItem(SHOWN_TODAY_KEY, getTodayKey())
                }
                setDone(true)
              }
            }}
          />
        </div>
      )}

      <div
        className={
          flyAcross
            ? 'daisy-fly-screen-wrap absolute left-0 top-0 flex flex-col items-end gap-3 pointer-events-auto animate-daisy-fly-screen'
            : 'relative'
        }
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="animate-daisy-float hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer drop-shadow-xl"
            aria-label={t('ariaLabel')}
          >
            <ButterflyIcon size={expanded ? 56 : 72} />
          </button>
          {!expanded && (
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center hover:bg-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
