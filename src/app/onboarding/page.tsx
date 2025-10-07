"use client";

import { ClientOnly } from '@/shared/components/ClientOnly';
import { useAuth } from '@/shared/hooks/useAuth';
import { OnboardingApiService } from '@/shared/services/onboarding';
import { OnboardingAnswer, OnboardingAnswerValue, OnboardingQuestion, OnboardingSection } from '@/shared/types/auth';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
              className={`w-full text-left p-4 border-2 rounded-xl flex items-center space-x-4 transition-all focus:outline-none ${
                selected
                  ? 'bg-[#FFDC61]/20 border-[#FFDC61] shadow-md'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              aria-pressed={selected}
            >
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${selected ? 'bg-[#FFDC61] text-black border-[#FFDC61]' : 'bg-white text-gray-600 border-gray-300'}`}>
                <span className="text-xl font-semibold">{opt.icon}</span>
              </span>
              <span className="text-base font-medium text-gray-800">{opt.label}</span>
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
          className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all"
          required={question.required}
        />
      )
    case 'single-choice':
      return (
        <div className="flex flex-col space-y-3">
          {question.options?.map((option) => (
            <label 
              key={option} 
              className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                answer === option 
                  ? 'bg-[#FFDC61]/20 border-[#FFDC61]' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={answer === option}
                onChange={(e) => onChange(e.target.value)}
                required={question.required}
                className="w-5 h-5 text-[#FFDC61] focus:ring-[#FFDC61]"
              />
              <span className="text-base font-medium text-gray-800">{option}</span>
            </label>
          ))}
        </div>
      )
    case 'text':
      return (
        <textarea
          value={(answer as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all resize-none"
          rows={4}
          placeholder={question.question}
          required={question.required}
        />
      )
    case 'scale-with-comment':
      const rating = (answer as { rating: number; comment: string })?.rating || 0
      const comment = (answer as { rating: number; comment: string })?.comment || ''
      return (
        <div className="space-y-4">
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ rating: val, comment })}
                className={`flex-1 h-14 rounded-xl border-2 font-semibold text-lg transition-all ${
                  rating === val 
                    ? 'bg-[#FFDC61] border-[#FFDC61] text-black shadow-md' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => onChange({ rating, comment: e.target.value })}
            className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition-all resize-none"
            placeholder={question.commentLabel || 'Add a comment (optional)'}
            rows={3}
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
  const [flatQuestions, setFlatQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onboardingService = new OnboardingApiService();

  useEffect(() => {
    if (!isAuthLoading && user?.isOnboarded) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await onboardingService.getQuestions();
        setSections(data);
        const flat = data.flatMap((s) => s.questions.map((q) => ({ ...q })));
        setFlatQuestions(flat);
      } catch (error) {
        console.error('Failed to load onboarding questions', error);
        setError('Failed to load questions. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId: string, value: OnboardingAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const nextQuestion = () => {
    const currentQuestion = flatQuestions[currentQuestionIndex];
    
    // Validate required fields
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setError('This question is required');
      return;
    }
    
    if (currentQuestionIndex < flatQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setError(null);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all required questions are answered
    const unansweredRequired = flatQuestions.filter(
      q => q.required && !answers[q.id]
    );
    
    if (unansweredRequired.length > 0) {
      setError('Please answer all required questions');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const finalAnswers: OnboardingAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      if (user) {
        // Authenticated: submit directly to backend
        await onboardingService.submitAnswers(finalAnswers);
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // Unauthenticated: save to guest endpoint and localStorage
        const response = await fetch('/api/onboarding/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers: finalAnswers }),
        });

        if (!response.ok) {
          throw new Error('Failed to save onboarding data');
        }

        const data = await response.json();
        
        // Store in localStorage for registration page
        localStorage.setItem('pending_onboarding', JSON.stringify(finalAnswers));
        localStorage.setItem('onboarding_session_id', data.sessionId);
        
        setSubmitSuccess(true);
        
        // Redirect to register after showing success message
        setTimeout(() => {
          router.push('/register');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to submit onboarding answers', error);
      setError('Failed to save your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthLoading || flatQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFDC61] mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = flatQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / flatQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFDC61] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D1E2D3] rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Get Your Personalized AI Therapist
              </h1>
              <p className="text-xl text-gray-300">
                We need to understand you better to provide the most effective support
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 pt-8"
            >
              {[
                'Personalized therapeutic approach',
                'Evidence-based CBT & DBT techniques',
                'Secure and confidential',
                'Available 24/7'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFDC61]" />
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* Progress indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-12"
            >
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FFDC61]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Question {currentQuestionIndex + 1} of {flatQuestions.length}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right side - Questions */}
        <div className="flex flex-col items-center justify-center p-6 lg:p-12">
          <AnimatePresence mode="wait">
            {submitSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Onboarding Complete!
                </h2>
                <p className="text-gray-600 text-lg">
                  {user ? 'Redirecting to your dashboard...' : 'Redirecting to registration...'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl"
              >
                {/* Mobile progress bar */}
                <div className="lg:hidden mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Progress</span>
                    <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FFDC61]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Question {currentQuestionIndex + 1} of {flatQuestions.length}
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-xl font-bold text-gray-900 mb-6">
                          {currentQuestion.question}
                          {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <QuestionComponent 
                          question={currentQuestion} 
                          answer={answers[currentQuestion.id]} 
                          onChange={(value) => handleAnswerChange(currentQuestion.id, value)} 
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between items-center pt-6">
                      <button
                        type="button"
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <ArrowLeft className="w-5 h-5" /> Back
                      </button>

                      {currentQuestionIndex < flatQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={nextQuestion}
                          className="px-6 py-3 bg-[#FFDC61] text-black rounded-xl flex items-center gap-2 font-semibold hover:bg-[#FFDC61]/90 transition-all shadow-lg shadow-[#FFDC61]/20"
                        >
                          Next <ArrowRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-green-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                            </>
                          ) : (
                            <>
                              Complete <CheckCircle className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 text-center pt-4">
                      By continuing, you agree to our{' '}
                      <a href="/terms" className="underline hover:text-gray-700">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>
                    </p>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
