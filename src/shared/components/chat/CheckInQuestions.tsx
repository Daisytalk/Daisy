'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { CheckInAnswers } from '@/app/actions/saveCheckIn'

const EMOJIS = ['😞', '😕', '😐', '🙂', '😊']

interface CheckInQuestionsProps {
  onComplete: (answers: CheckInAnswers) => Promise<void>
}

export function CheckInQuestions({ onComplete }: CheckInQuestionsProps) {
  const t = useTranslations('profile.checkin')
  const [answers, setAnswers] = useState<Partial<CheckInAnswers>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const QUESTIONS = [
    { key: 'emotion' as const, label: t('questions.emotion'), left: t('scaleLeft.emotion'), right: t('scaleRight.emotion') },
    { key: 'stress' as const, label: t('questions.stress'), left: t('scaleLeft.stress'), right: t('scaleRight.stress') },
    { key: 'energy' as const, label: t('questions.energy'), left: t('scaleLeft.energy'), right: t('scaleRight.energy') },
    { key: 'support' as const, label: t('questions.support'), left: t('scaleLeft.support'), right: t('scaleRight.support') },
  ] as const

  const allSelected = QUESTIONS.every((q) => answers[q.key] != null)

  const handleSelect = (key: keyof CheckInAnswers, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!allSelected || submitting) return
    setSubmitting(true)
    try {
      await onComplete(answers as CheckInAnswers)
      setDone(true)
    } catch {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center text-green-600 font-medium py-4"
      >
        {t('saved')}
      </motion.p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {QUESTIONS.map((q) => (
        <div key={q.key}>
          <p className="text-xs text-muted-foreground mb-2">{q.label}</p>
          <div className="flex gap-1 justify-between">
            {EMOJIS.map((emoji, i) => {
              const value = i + 1
              const isSelected = answers[q.key] === value
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(q.key, value)}
                  className={`
                    w-10 h-10 rounded-xl text-lg flex items-center justify-center
                    transition-all duration-200
                    ${isSelected ? 'scale-125 ring-2 ring-violet-400 bg-violet-50' : 'bg-muted/50 hover:bg-muted'}
                  `}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={!allSelected || submitting}
        className="mt-2 w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? t('saving') : t('done')}
      </button>
    </div>
  )
}
