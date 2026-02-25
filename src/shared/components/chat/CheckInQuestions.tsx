'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CheckInAnswers } from '@/app/actions/saveCheckIn'

const QUESTIONS = [
  { key: 'emotion' as const, label: 'Эмоциональное состояние', left: 'Очень тяжело', right: 'В ресурсе' },
  { key: 'stress' as const, label: 'Уровень стресса', left: 'Очень высокий', right: 'Всё спокойно' },
  { key: 'energy' as const, label: 'Энергия', left: 'Нет сил', right: 'Много сил' },
  { key: 'support' as const, label: 'Уровень поддержки', left: 'Одна', right: 'Чувствую опору' },
] as const

const EMOJIS = ['😞', '😕', '😐', '🙂', '😊']

interface CheckInQuestionsProps {
  onComplete: (answers: CheckInAnswers) => Promise<void>
}

export function CheckInQuestions({ onComplete }: CheckInQuestionsProps) {
  const [answers, setAnswers] = useState<Partial<CheckInAnswers>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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
        ✓ Записала 🌸
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
        {submitting ? 'Сохранение...' : '→ Готово 🤍'}
      </button>
    </div>
  )
}
