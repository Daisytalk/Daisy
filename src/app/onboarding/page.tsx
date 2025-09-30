"use client";

import { ClientOnly } from '@/shared/components/ClientOnly';
import { useAuth } from '@/shared/hooks/useAuth';
import { OnboardingApiService } from '@/shared/services/onboarding';
import { OnboardingAnswer, OnboardingAnswerValue, OnboardingQuestion, OnboardingSection } from '@/shared/types/auth';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

// A generic component to render different question types
const QuestionComponent = ({
  question,
  answer,
  onChange,
}: {
  question: OnboardingQuestion;
  answer: OnboardingAnswerValue;
  onChange: (value: OnboardingAnswerValue) => void;
}) => {
  // Special UI for the gender question to match design
  if (question.id === 'gender' || /gender|sex/i.test(question.id)) {
    const options = [
      { id: 'male', label: 'Male', icon: '♂' },
      { id: 'female', label: 'Female', icon: '♀' },
      { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: '✕' },
      { id: 'other', label: 'Other', icon: '…' },
    ];

    return (
      <div className="space-y-3">
        {options.map((opt) => {
          const selected = answer === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`w-full text-left p-3 border rounded-lg flex items-center space-x-4 transition-colors focus:outline-none ${
                selected
                  ? 'bg-[#dff6ff] border-[#7fd6ff] shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              aria-pressed={selected}
            >
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-md border ${selected ? 'bg-[#0EA5E9] text-white border-transparent' : 'bg-white text-[#0EA5E9] border-[#E6EEF6]'}`}>
                <span className="text-base font-semibold">{opt.icon}</span>
              </span>
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  switch (question.type) {
    case 'date':
      return (
        <input
          type="date"
          value={(answer as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
          required={question.required}
        />
      )
    case 'single-choice':
      return (
        <div className="flex flex-col space-y-2">
          {question.options?.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={answer === option}
                onChange={(e) => onChange(e.target.value)}
                required={question.required}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    case 'text':
      return (
        <textarea
          value={(answer as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder={question.question}
          required={question.required}
        />
      )
    case 'scale-with-comment':
      const rating = (answer as { rating: number; comment: string })?.rating || 0
      const comment = (answer as { rating: number; comment: string })?.comment || ''
      return (
        <div className="space-y-4">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ rating: val, comment })}
                className={`w-10 h-10 rounded-full border ${
                  rating === val ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => onChange({ rating, comment: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder={question.commentLabel}
          />
        </div>
      )
    default:
      return null
  }
}

function OnboardingPageContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [sections, setSections] = useState<OnboardingSection[]>([]);
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswerValue>>({});
  // Flattened list of questions so we can show one question per page
  const [flatQuestions, setFlatQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const onboardingService = new OnboardingApiService();

  useEffect(() => {
    // Middleware now handles redirects, but we can still show a loading state.
    if (!isAuthLoading && user?.isOnboarded) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await onboardingService.getQuestions();
        setSections(data);
        // build flattened question list preserving order
        const flat = data.flatMap((s) => s.questions.map((q) => ({ ...q })));
        setFlatQuestions(flat);
      } catch (error) {
        console.error('Failed to load onboarding questions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId: string, value: OnboardingAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < flatQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalAnswers: OnboardingAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      if (user) {
        // Authenticated: submit directly to backend which will persist to DB
        await onboardingService.submitAnswers(finalAnswers);
        router.push('/dashboard');
      } else {
        // Unauthenticated: persist to localStorage and prompt to register
        localStorage.setItem('pending_onboarding', JSON.stringify(finalAnswers));
        // Show a message and a button to navigate to register
        setShowRegisterPrompt(true);
      }
    } catch (error) {
      console.error('Failed to submit onboarding answers', error);
      // TODO: show error to user
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthLoading || flatQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const currentQuestion = flatQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / flatQuestions.length) * 100;

  return (
    <div className="grid md:grid-cols-2 min-h-screen">
      <div className="bg-blue-600 text-white p-12 flex flex-col justify-center">
        <h1 className="text-4xl font-bold">Get Yourself Personalized AI Therapist With TalkToDaisy.</h1>
        <p className="text-xl mt-4">We Will Have An Onboarding Before Moving Forward</p>
      </div>
      <div className="bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800">{currentQuestion ? currentQuestion.question : 'Question'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-8">
              {currentQuestion && (
                <div key={currentQuestion.id}>
                  <label className="block text-md font-medium text-gray-700 mb-2">
                    {currentQuestion.question}
                    {currentQuestion.required && <span className="text-red-500">*</span>}
                  </label>
                  <QuestionComponent question={currentQuestion} answer={answers[currentQuestion.id]} onChange={(value) => handleAnswerChange(currentQuestion.id, value)} />
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border rounded-md disabled:opacity-50 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>

              {currentQuestionIndex < flatQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Complete Onboarding'
                    )}
                  </button>
                  {showRegisterPrompt && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                      <p className="text-sm text-gray-800 mb-2">
                        Register to continue with your personal AI Companion
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => router.push('/register')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Register
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem('pending_onboarding');
                            router.push('/');
                          }}
                          className="px-4 py-2 border rounded-md"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              By entering your information and continuing you agree to our Terms of Service | Privacy Policy
              <br />
              Please review before continuing
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ClientOnly>
      <OnboardingPageContent />
    </ClientOnly>
  );
}