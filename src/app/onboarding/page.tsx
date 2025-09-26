"use client"

// FIX: Import FormEvent to correctly type the form submission event.
import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import type { OnboardingSection, OnboardingAnswer, OnboardingAnswerValue, OnboardingQuestion } from '@/shared/types/auth'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

// A generic component to render different question types
const QuestionComponent = ({ question, answer, onChange }: { question: OnboardingQuestion, answer: OnboardingAnswerValue, onChange: (value: OnboardingAnswerValue) => void }) => {
  switch (question.type) {
    case 'date':
      return <input type="date" value={answer as string || ''} onChange={e => onChange(e.target.value)} className="w-full p-2 border rounded" required={question.required} />;
    case 'single-choice':
      return (
        <div className="flex flex-col space-y-2">
          {question.options?.map(option => (
            <label key={option} className="flex items-center space-x-2">
              <input type="radio" name={question.id} value={option} checked={answer === option} onChange={e => onChange(e.target.value)} required={question.required} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    case 'text':
      return <textarea value={answer as string || ''} onChange={e => onChange(e.target.value)} className="w-full p-2 border rounded" rows={3} placeholder={question.question} required={question.required} />;
    case 'scale-with-comment':
      const rating = (answer as { rating: number; comment: string })?.rating || 0;
      const comment = (answer as { rating: number; comment: string })?.comment || '';
      return (
        <div className="space-y-4">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map(val => (
              <button key={val} type="button" onClick={() => onChange({ rating: val, comment })} className={`w-10 h-10 rounded-full border ${rating === val ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                {val}
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => onChange({ rating, comment: e.target.value })} className="w-full p-2 border rounded" placeholder={question.commentLabel} />
        </div>
      );
    default:
      return null;
  }
};

function OnboardingPageContent() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [sections, setSections] = useState<OnboardingSection[]>([])
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswerValue>>({})
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    // Middleware now handles redirects, but we can still show a loading state.
    if (!isAuthLoading && user?.isOnboarded) {
      router.push('/dashboard')
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await onboardingService.getQuestions()
        setSections(data)
      } catch (error) {
        console.error('Failed to load onboarding questions', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleAnswerChange = (questionId: string, value: OnboardingAnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const nextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalAnswers: OnboardingAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    try {
      await onboardingService.submitAnswers(finalAnswers);
      // It's good practice to update the local user state or re-fetch it.
      // For now, we'll rely on the next page to have the updated user state from `useAuth`.
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to submit onboarding answers', error);
      // TODO: show error to user
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoading || isAuthLoading || sections.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>
  }

  const currentSection = sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }} />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">{currentSection.title}</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {currentSection.questions.map(q => (
              <div key={q.id}>
                <label className="block text-md font-medium text-gray-700 mb-2">{q.question}{q.required && <span className="text-red-500">*</span>}</label>
                <QuestionComponent question={q} answer={answers[q.id]} onChange={value => handleAnswerChange(q.id, value)} />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button type="button" onClick={prevSection} disabled={currentSectionIndex === 0} className="px-6 py-2 border rounded-md disabled:opacity-50 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            
            {currentSectionIndex < sections.length - 1 ? (
              <button type="button" onClick={nextSection} className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-md disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Complete Onboarding'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function OnboardingPage() {
  return <OnboardingPageContent />
}
