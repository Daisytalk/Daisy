'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { CheckInQuestions } from '@/shared/components/chat/CheckInQuestions'
import { saveCheckIn } from '@/app/actions/saveCheckIn'

interface DailyCheckInModalProps {
  userName: string
  hasCheckInToday?: boolean
}

export function DailyCheckInModal({ userName, hasCheckInToday }: DailyCheckInModalProps) {
  const t = useTranslations('profile.checkin')
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [hasCheckIn, setHasCheckIn] = useState(hasCheckInToday ?? false)
  const locale = useLocale()

  useEffect(() => {
    if (hasCheckInToday != null) setHasCheckIn(hasCheckInToday)
  }, [hasCheckInToday])

  if (hasCheckIn || done) return null

  return (
    <div className="flex justify-center">
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-2xl bg-[#e0f7fa] text-[#5ba3c6] font-medium hover:bg-[#b2ebf2] transition-colors text-sm shadow-sm"
      >
        {t('questionToday', { name: userName })}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-gray-700 text-center mb-4">
              {t('question', { name: userName })}
            </p>
            <CheckInQuestions
              onComplete={async (answers) => {
                await saveCheckIn(answers)
                setDone(true)
                setOpen(false)
              }}
            />
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {t('notNow')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
