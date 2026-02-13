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
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Progress } from '@/shared/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'

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
  if (question.id === 'gender' || /gender|sex/i.test(question.id)) {
    const options = [
      { id: 'male', label: t('male'), icon: '♂' },
      { id: 'female', label: t('female'), icon: '♀' },
      { id: 'prefer_not_to_say', label: t('preferNotToSay'), icon: '✕' },
      { id: 'other', label: t('other'), icon: '…' },
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
    case 'date':
      return (
        <Input
          type="date"
          value={(answer as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="h-12 rounded-2xl border-2"
        />
      )
    case 'single-choice':
      return (
        <RadioGroup value={answer as string} onValueChange={onChange}>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  answer === option ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value={option} id={option} />
                <span className="font-medium">{option}</span>
              </label>
            ))}
          </div>
        </RadioGroup>
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
      return (
        <Input
          type="text"
          value={(answer as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('typeYourAnswer')}
          required={question.required}
          className="h-12 rounded-2xl border-2"
        />
      )
  }
}

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
      } catch (error) {
        console.error('Failed to load onboarding questions', error)
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
    
    if (currentQuestion.required && !answers[currentQuestion.id]) {
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
      q => q.required && !answers[q.id]
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
        setSubmitSuccess(true)
        setTimeout(() => {
          router.push(`/${locale}/chat`)
        }, 1500)
      } else {
        localStorage.setItem('pending_onboarding', JSON.stringify(finalAnswers))
        router.push(`/${locale}/register`)
      }
    } catch (error) {
      console.error('Onboarding submission error:', error)
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
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
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
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

  const currentQuestion = flatQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / flatQuestions.length) * 100

  // Русская локализация текста вопроса и commentLabel из messages
  const questionTextKey = `questions.${currentQuestion.id}.question`
  const commentLabelKey = `questions.${currentQuestion.id}.commentLabel`
  const translatedQuestion = t(questionTextKey)
  const translatedCommentLabel = t(commentLabelKey)
  const displayQuestion: OnboardingQuestion = {
    ...currentQuestion,
    question: translatedQuestion && !translatedQuestion.startsWith('questions.') ? translatedQuestion : currentQuestion.question,
    commentLabel: translatedCommentLabel && !translatedCommentLabel.startsWith('questions.') ? translatedCommentLabel : (currentQuestion.commentLabel ?? t('comment')),
  }

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
                  {displayQuestion.question}
                  {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
                </h2>

                <QuestionComponent
                  question={displayQuestion}
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
