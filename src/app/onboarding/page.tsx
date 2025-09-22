'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, MapPin, MoreHorizontal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import type { OnboardingQuestion, OnboardingAnswer } from '@/shared/types/auth'

// Default questions that match your image
const defaultQuestions: OnboardingQuestion[] = [
  {
    id: '1',
    type: 'single-choice',
    question: 'Choose your gender/sex',
    options: ['Male', 'Female', 'Prefer not to say', 'Other'],
    required: true,
    order: 1
  }
]

export default function OnboardingPage() {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>(defaultQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswer>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.isOnboarded) {
      router.push('/dashboard')
      return
    }

    loadQuestions()
  }, [user, router])

  const loadQuestions = async () => {
    try {
      const fetchedQuestions = await onboardingService.getQuestions()
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions.sort((a, b) => a.order - b.order))
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      // Use default questions if API fails
    } finally {
      setIsLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = !currentQuestion?.required || answers[currentQuestion.id]

  const handleAnswer = (questionId: string, answer: string | string[] | number | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, answer }
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onboardingService.submitAnswers(Object.values(answers))
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to submit onboarding:', error)
      alert('Failed to submit onboarding. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestionInput = (question: OnboardingQuestion) => {
    const currentAnswer = answers[question.id]?.answer

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const icons = [User, MapPin, X, MoreHorizontal]
              const Icon = icons[index] || User
              const isSelected = currentAnswer === option

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(question.id, option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const selectedOptions = (currentAnswer as string[]) || []
              const isSelected = selectedOptions.includes(option)

              return (
                <button
                  key={option}
                  onClick={() => {
                    const newSelection = isSelected
                      ? selectedOptions.filter(item => item !== option)
                      : [...selectedOptions, option]
                    handleAnswer(question.id, newSelection)
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            rows={4}
            placeholder="Type your answer here..."
          />
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Not at all</span>
              <span>Extremely</span>
            </div>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(question.id, value)}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-all ${currentAnswer === value
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )

      case 'boolean':
        return (
          <div className="flex space-x-4">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(question.id, option === 'Yes')}
                className={`flex-1 p-4 rounded-lg border-2 font-semibold transition-all ${currentAnswer === (option === 'Yes')
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">No questions available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex">
      {/* Left Panel */}
      <div className="w-1/3 p-12 flex flex-col justify-center text-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6">
            Get Yourself Personalized AI Therapist With TalkToDaisy.
          </h1>
          <p className="text-xl text-blue-100">
            We Will Have An Onboarding Before Moving Forward
          </p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-gray-50 p-12 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  {currentQuestion.question}
                </h2>
                {renderQuestionInput(currentQuestion)}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : isLastQuestion ? (
                'Complete'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Terms */}
          <p className="text-sm text-gray-500 text-center mt-8">
            By entering your information and continuing you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
            {' | '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            <br />
            Please review before continuing
          </p>
        </div>
      </div>
    </div>
  )
}