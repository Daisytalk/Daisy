'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import { OnboardingAnswer, OnboardingAnswerValue, OnboardingQuestion } from '@/shared/types/auth'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'

// ─── Communication style definitions ────────────────────────────────────────

const COMMUNICATION_STYLES = [
  {
    id: 'warm_friend',
    name: 'Тёплая подруга',
    keywords: 'душевная, понимающая, мягкая',
    example: '"Я вижу, как тебе сейчас непросто. Давай вместе разберёмся. Ты не одна в этом."',
  },
  {
    id: 'practical_helper',
    name: 'Практичный помощник',
    keywords: 'конкретный, структурированный, честный',
    example: '"Хорошо, что конкретно можно сделать сегодня, чтобы приблизиться к решению?"',
  },
  {
    id: 'gentle_explorer',
    name: 'Мягкий исследователь',
    keywords: 'любопытный, рефлексивный, глубокий',
    example: '"Как вы думаете, откуда может идти это чувство? Что оно пытается вам сказать?"',
  },
  {
    id: 'calm_mentor',
    name: 'Спокойный наставник',
    keywords: 'уравновешенный, принимающий, терпеливый',
    example: '"Всё, что вы чувствуете, имеет право быть. Давайте понаблюдаем без спешки."',
  },
  {
    id: 'wise_teacher',
    name: 'Мудрый учитель',
    keywords: 'информативный, научный, обучающий',
    example: '"То, что вы описываете, называется когнитивным искажением. Вот как это работает…"',
  },
  {
    id: 'flexible_companion',
    name: 'Гибкая собеседница',
    keywords: 'чуткий, ситуативный, настраиваемый',
    example: 'Дэйзи подстраивается под потребность — иногда поддержит, иногда направит.',
  },
]

// ─── Scale labels per question ───────────────────────────────────────────────

const SCALE_LABELS: Record<string, string[]> = {
  'professional-life': [
    '😞 Очень тяжело, выгорание',
    '😕 Много стресса',
    '😐 Справляюсь, но без удовольствия',
    '🙂 В целом доволен(а)',
    '😊 Всё отлично, чувствую смысл',
  ],
  'family-relationships': [
    '😞 Много конфликтов, нет поддержки',
    '😕 Скорее напряжённо',
    '😐 Нейтрально, без близости',
    '🙂 Скорее поддерживающая',
    '😊 Тепло и стабильно',
  ],
  'social-relationships': [
    '😞 Совсем нет поддержки',
    '😕 Скорее одиноко',
    '😐 Есть люди, но без близости',
    '🙂 Есть близкие люди',
    '😊 Сильный круг поддержки',
  ],
  'autonomy': [
    '😞 Одиночество вызывает тревогу',
    '😕 Скорее тревожно',
    '😐 Нейтрально, терплю',
    '🙂 Скорее комфортно',
    '😊 Полностью комфортно',
  ],
  'physical-health-rating': [
    '😞 Плохой сон, нет энергии',
    '😕 Часто усталость',
    '😐 В целом терпимо',
    '🙂 Большинство дней хорошо',
    '😊 Сон, питание и энергия в порядке',
  ],
  'emotional-wellbeing': [
    '😞 Постоянная тревога, трудно функционировать',
    '😕 Часто дискомфортно',
    '😐 Бывает по-разному',
    '🙂 В основном стабильно',
    '😊 Чувствую себя в ресурсе',
  ],
  'leisure-hobbies': [
    '😞 Ничего не приносит радости',
    '😕 Редко и без удовольствия',
    '😐 Иногда есть, но нерегулярно',
    '🙂 Есть приятные занятия',
    '😊 Досуг — важная часть жизни',
  ],
  'living-conditions': [
    '😞 Небезопасно, влияет на состояние',
    '😕 Скорее дискомфортно',
    '😐 Терпимо, базовые потребности закрыты',
    '🙂 Скорее комфортно',
    '😊 Безопасно и уютно',
  ],
  'financial-status': [
    '😞 Постоянный стресс, не хватает на базовое',
    '😕 Скорее нестабильно',
    '😐 Хватает, но без запаса',
    '🙂 Есть небольшая подушка',
    '😊 Финансово спокоен(а)',
  ],
  'romantic-relationships': [
    '😞 Много конфликтов, токсично',
    '😕 Скорее нестабильно',
    '😐 Спокойно, но нет глубины',
    '🙂 Чувствую поддержку',
    '😊 Стабильно, тепло и взаимно',
  ],
}

// ─── QuestionComponent ───────────────────────────────────────────────────────

const QuestionComponent = ({
  question,
  answer,
  onChange,
  t,
}: {
  question: OnboardingQuestion
  answer: OnboardingAnswerValue
  onChange: (value: OnboardingAnswerValue) => void
  t: (key: string) => string
}) => {
  // Gender card selector
  if (question.id === 'gender') {
    const options = [
      { id: 'Мужской', label: 'Мужской', icon: '♂' },
      { id: 'Женский', label: 'Женский', icon: '♀' },
      { id: 'Другое', label: 'Другое', icon: '…' },
      { id: 'Предпочитаю не указывать', label: 'Не указывать', icon: '✕' },
    ]
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const selected = answer === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                selected ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40 hover:bg-muted/50'
              }`}
              onClick={() => onChange(opt.id)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {opt.icon}
              </div>
              <span className="font-medium">{opt.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  switch (question.type) {
    case 'yes-no-conditional-text': {
      const val: { yes?: boolean; detail?: string } = (answer as { yes?: boolean; detail?: string }) ?? {}
      const isYes = val.yes === true
      const isNo = val.yes === false
      return (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ yes: true, detail: val.detail ?? '' })}
              className={`flex-1 py-3 rounded-2xl border-2 font-medium transition-all ${
                isYes ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
              }`}
            >
              Да
            </button>
            <button
              type="button"
              onClick={() => onChange({ yes: false })}
              className={`flex-1 py-3 rounded-2xl border-2 font-medium transition-all ${
                isNo ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
              }`}
            >
              Нет
            </button>
          </div>
          {isYes && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Textarea
                value={val.detail ?? ''}
                onChange={(e) => onChange({ yes: true, detail: e.target.value })}
                placeholder="Опишите подробнее..."
                rows={3}
                className="rounded-2xl border-2 min-h-[90px]"
              />
            </motion.div>
          )}
        </div>
      )
    }

    case 'yes-no-conditional-multiselect': {
      const val: { yes?: boolean; selected?: string[] } = (answer as { yes?: boolean; selected?: string[] }) ?? {}
      const isYes = val.yes === true
      const isNo = val.yes === false
      const selected = val.selected ?? []
      const toggleOption = (opt: string) => {
        const next = selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt]
        onChange({ yes: true, selected: next })
      }
      return (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ yes: true, selected: val.selected ?? [] })}
              className={`flex-1 py-3 rounded-2xl border-2 font-medium transition-all ${
                isYes ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
              }`}
            >
              Да
            </button>
            <button
              type="button"
              onClick={() => onChange({ yes: false })}
              className={`flex-1 py-3 rounded-2xl border-2 font-medium transition-all ${
                isNo ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
              }`}
            >
              Нет
            </button>
          </div>
          {isYes && question.conditionalOptions && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
              {question.conditionalOptions.map((opt) => {
                const checked = selected.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`px-4 py-2 rounded-2xl border-2 text-sm font-medium transition-all ${
                      checked ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </motion.div>
          )}
        </div>
      )
    }

    case 'yes-no-conditional-scale': {
      const val: { hasRelationship?: boolean; rating?: number } = (answer as { hasRelationship?: boolean; rating?: number }) ?? {}
      const hasRel = val.hasRelationship === true
      const noRel = val.hasRelationship === false
      const rating = val.rating ?? 0
      const labels = SCALE_LABELS[question.id] ?? []
      return (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ hasRelationship: true, rating: val.rating })}
              className={`flex-1 py-3 rounded-2xl border-2 font-medium transition-all ${
                hasRel ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
              }`}
            >
              Да
            </button>
            <button
              type="button"
              onClick={() => onChange({ hasRelationship: false })}
              className={`flex-1 py-3 rounded-2xl border-2 font-medium transition-all ${
                noRel ? 'border-primary bg-primary/10 text-primary' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
              }`}
            >
              Нет
            </button>
          </div>
          {hasRel && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((v) => {
                const sel = rating === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onChange({ hasRelationship: true, rating: v })}
                    className={`flex flex-col items-center justify-center gap-2 w-24 min-h-[5.5rem] p-3 rounded-2xl border-2 transition-all ${
                      sel ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] bg-white hover:border-primary/40'
                    }`}
                  >
                    <span className="text-2xl font-bold text-foreground/70">{v}</span>
                    <span className="text-[11px] text-center text-foreground/80 leading-tight">
                      {labels[v - 1] ?? ''}
                    </span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </div>
      )
    }

    case 'scale-with-comment': {
      const scaleAnswer = (answer as { rating?: number; comment?: string } | null) ?? {}
      const rating = scaleAnswer.rating ?? 0
      const comment = scaleAnswer.comment ?? ''
      const labels = SCALE_LABELS[question.id] ?? []
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((v) => {
              const selected = rating === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ ...scaleAnswer, rating: v, comment })}
                  className={`flex flex-col items-center justify-center gap-2 w-24 min-h-[5.5rem] p-3 rounded-2xl border-2 transition-all shadow-sm ${
                    selected
                      ? 'border-primary bg-primary/10 shadow-primary/10'
                      : 'border-[hsl(var(--app-border))] bg-white hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <span className="text-2xl font-bold text-foreground/70">{v}</span>
                  <span className="text-[11px] font-medium text-center text-foreground/80 leading-tight min-h-[2.5rem] flex items-center justify-center">
                    {labels[v - 1] ?? t(v === 1 ? 'scaleVeryBad' : v === 2 ? 'scaleBad' : v === 3 ? 'scaleNormal' : v === 4 ? 'scaleGood' : 'scaleExcellent')}
                  </span>
                </button>
              )
            })}
          </div>
          {question.commentLabel && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {question.commentLabel}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => onChange({ ...scaleAnswer, rating, comment: e.target.value })}
                placeholder={t('typeYourAnswer')}
                rows={3}
                className="rounded-2xl border-2 min-h-[80px]"
              />
            </div>
          )}
        </div>
      )
    }

    case 'style-selection': {
      const selected = (answer as string[] | null) ?? []
      const toggle = (id: string) => {
        if (selected.includes(id)) {
          onChange(selected.filter((s) => s !== id))
        } else if (selected.length < 2) {
          onChange([...selected, id])
        }
      }
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Выберите 1-2 стиля, которые вам наиболее близки</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMUNICATION_STYLES.map((style) => {
              const isSelected = selected.includes(style.id)
              const isDisabled = !isSelected && selected.length >= 2
              return (
                <button
                  key={style.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggle(style.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : isDisabled
                        ? 'border-[hsl(var(--app-border))] opacity-40 cursor-not-allowed'
                        : 'border-[hsl(var(--app-border))] hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <p className="font-semibold text-foreground mb-1">{style.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{style.keywords}</p>
                  <p className="text-xs text-foreground/70 italic leading-snug">{style.example}</p>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    case 'single-choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                answer === option ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40 hover:bg-muted/50'
              }`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
      )

    case 'text':
      return (
        <Textarea
          value={(answer as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('typeYourAnswer')}
          required={question.required}
          rows={4}
          className="rounded-2xl border-2 min-h-[120px]"
        />
      )

    default:
      return null
  }
}

// ─── isAnswerEmpty ────────────────────────────────────────────────────────────

function isAnswerEmpty(q: OnboardingQuestion, value: OnboardingAnswerValue): boolean {
  if (!q.required) return false
  if (value == null) return true

  switch (q.type) {
    case 'scale-with-comment': {
      const o = value as { rating?: number } | null
      return !o || typeof o.rating !== 'number' || o.rating < 1
    }
    case 'yes-no-conditional-text':
    case 'yes-no-conditional-multiselect':
    case 'yes-no-conditional-scale': {
      const o = value as Record<string, unknown>
      return o.yes === undefined && o.hasRelationship === undefined
    }
    case 'style-selection': {
      return !Array.isArray(value) || (value as string[]).length === 0
    }
    default:
      return value === ''
  }
}

// ─── OnboardingPageContent ────────────────────────────────────────────────────

function OnboardingPageContent() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('onboarding')
  const { user, isLoading: isAuthLoading } = useAuth()
  const [flatQuestions, setFlatQuestions] = useState<OnboardingQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswerValue>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    if (!isAuthLoading && user?.isOnboarded) {
      router.push(`/${locale}/chat`)
    }
  }, [user, isAuthLoading, router, locale])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await onboardingService.getQuestions()
        const flat = data.flatMap((s) => s.questions.map((q) => ({ ...q })))
        setFlatQuestions(flat)
      } catch (err) {
        console.error('Failed to load onboarding questions', err)
        setError('Failed to load questions. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleAnswerChange = (questionId: string, value: OnboardingAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setError(null)
  }

  const nextQuestion = () => {
    const currentQuestion = flatQuestions[currentQuestionIndex]
    if (currentQuestion.required && isAnswerEmpty(currentQuestion, answers[currentQuestion.id])) {
      setError(t('required'))
      return
    }
    if (currentQuestionIndex < flatQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      setError(null)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1)
      setError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const unansweredRequired = flatQuestions.filter(
      (q) => q.required && isAnswerEmpty(q, answers[q.id])
    )
    if (unansweredRequired.length > 0) {
      setError(t('answerAllRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    const finalAnswers: OnboardingAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))

    try {
      if (user) {
        await onboardingService.submitAnswers(finalAnswers)

        // Also save communication style to User.aiProfile
        const styleAnswer = answers['communication-style']
        if (styleAnswer && Array.isArray(styleAnswer) && styleAnswer.length > 0) {
          const token = localStorage.getItem('auth_token')
          await fetch('/api/account/style', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ styles: styleAnswer }),
          })
        }

        setSubmitSuccess(true)
        setTimeout(() => {
          router.push(`/${locale}/chat`)
        }, 1500)
      } else {
        localStorage.setItem('pending_onboarding', JSON.stringify(finalAnswers))
        router.push(`/${locale}/register`)
      }
    } catch (err) {
      console.error('Onboarding submission error:', err)
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--app-bg))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-[var(--app-radius-lg)] bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[hsl(var(--app-bg))] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{t('allSet')}</h2>
          <p className="text-muted-foreground">{t('redirecting')}</p>
        </motion.div>
      </div>
    )
  }

  if (flatQuestions.length === 0) return null

  const currentQuestion = flatQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / flatQuestions.length) * 100

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--app-bg))]">
      <div className="shrink-0 h-1.5 w-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {t('questionOf', { current: currentQuestionIndex + 1, total: flatQuestions.length })}
          </p>
          <form onSubmit={handleSubmit} id="onboarding-form">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                  {currentQuestion.question}
                  {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
                </h2>

                <QuestionComponent
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  t={t}
                />

                {error && (
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-[hsl(var(--app-border))]">
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl text-muted-foreground hover:text-foreground"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {flatQuestions.length}
          </span>
          {currentQuestionIndex < flatQuestions.length - 1 ? (
            <Button type="button" className="rounded-2xl" onClick={nextQuestion}>
              {t('next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" form="onboarding-form" className="rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('complete')}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <ClientOnly>
      <OnboardingPageContent />
    </ClientOnly>
  )
}
