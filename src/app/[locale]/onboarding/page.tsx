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
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
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
            <Card
              key={opt.id}
              className={`cursor-pointer transition-all ${
                selected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`}
              onClick={() => onChange(opt.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {opt.icon}
                </div>
                <span className="font-medium">{opt.label}</span>
              </CardContent>
            </Card>
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
        />
      )
    case 'single-choice':
      return (
        <RadioGroup value={answer as string} onValueChange={onChange}>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <Card
                key={option}
                className={`cursor-pointer transition-all ${
                  answer === option ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                </CardContent>
              </Card>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('allSet')}</h2>
          <p className="text-gray-600">{t('redirecting')}</p>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = flatQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / flatQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}</h1>
                <p className="text-sm text-gray-600">
                  {t('questionOf', { current: currentQuestionIndex + 1, total: flatQuestions.length })}
                </p>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {currentQuestion.question}
                      {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                    </h2>
                  </div>

                  <QuestionComponent
                    question={currentQuestion}
                    answer={answers[currentQuestion.id]}
                    onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    t={t}
                  />

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('previous')}
                    </Button>

                    {currentQuestionIndex < flatQuestions.length - 1 ? (
                      <Button type="button" onClick={nextQuestion}>
                        {t('next')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? t('submitting') : t('complete')}
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
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
