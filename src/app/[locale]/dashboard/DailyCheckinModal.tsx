'use client'

import { useState } from 'react'

export function DailyCheckinModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    emotion: 3,
    stress: 3,
    energy: 3,
    support: 3
  })
  const [submitting, setSubmitting] = useState(false)

  const steps = [
    { key: 'emotion', question: '1. Эмоциональное состояние', left: 'Очень тяжело', right: 'В ресурсе' },
    { key: 'stress', question: '2. Уровень стресса', left: 'Очень высокий', right: 'Всё спокойно' },
    { key: 'energy', question: '3. Энергия', left: 'Совсем нет сил', right: 'Много сил' },
    { key: 'support', question: '4. Уровень поддержки', left: 'Чувствую себя одной', right: 'Чувствую опору' }
  ]

  const handleSelect = (val: number) => {
    setAnswers(prev => ({ ...prev, [steps[step].key]: val }))
    if (step < 3) {
      setTimeout(() => setStep(step + 1), 300)
    } else {
      submitAnswers({ ...answers, [steps[step].key]: val })
    }
  }

  const submitAnswers = async (finalAnswers: typeof answers) => {
    setSubmitting(true)
    try {
      await fetch('/api/account/stress-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'daily_checkin',
          ...finalAnswers
        })
      })
      onSuccess()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-daisy-900 border border-daisy-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-daisy-200 uppercase text-xs tracking-wider">Алия, один момент</h3>
          <button onClick={onClose} className="text-daisy-500 hover:text-daisy-300">✕</button>
        </div>
        
        <p className="text-lg font-serif text-daisy-100 mb-6">Как ты сейчас? Четыре быстрых вопроса 🤍</p>

        {submitting ? (
          <div className="text-center text-daisy-400 py-10">Отправляем...</div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h4 className="font-medium text-daisy-200 mb-4">{steps[step].question}</h4>
            
            <div className="flex justify-between items-center mb-2 px-1">
              {[1,2,3,4,5].map(val => (
                <button
                  key={val}
                  onClick={() => handleSelect(val)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    answers[steps[step].key as keyof typeof answers] === val 
                      ? 'bg-daisy-700 ring-2 ring-daisy-400 scale-110' 
                      : 'bg-daisy-800/50 hover:bg-daisy-800'
                  }`}
                >
                  {val === 1 && '😞'}
                  {val === 2 && '😕'}
                  {val === 3 && '😐'}
                  {val === 4 && '🙂'}
                  {val === 5 && '😊'}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-daisy-400 mt-2 px-1">
              <span>{steps[step].left}</span>
              <span>{steps[step].right}</span>
            </div>
            
            {/* Progress indicators */}
            <div className="flex gap-1 mt-8 justify-center">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-daisy-400' : (i < step ? 'w-2 bg-daisy-600' : 'w-2 bg-daisy-800')}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
