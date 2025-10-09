"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, User as UserIcon, Mail, Calendar, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import type { OnboardingData, OnboardingQuestion } from '@/shared/types/auth'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

function ProfilePageContent() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const [data, sections] = await Promise.all([
        onboardingService.getOnboardingData(user.id),
        onboardingService.getQuestions()
      ])
      setOnboardingData(data)
      const allQuestions: OnboardingQuestion[] = sections.flatMap(section => section.questions)
      setQuestions(allQuestions)
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestionText = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    return question?.question || `Question ${questionId}`
  }

  const formatAnswer = (answer: any) => {
    if (typeof answer === 'object' && answer !== null) {
      if (answer.rating !== undefined) {
        return `Rating: ${answer.rating}/5${answer.comment ? ` - ${answer.comment}` : ''}`
      }
      return JSON.stringify(answer)
    }
    if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No'
    }
    return String(answer)
  }

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 14

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FFDC61] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFDC61] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D1E2D3] rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-900 shadow-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
              <p className="text-gray-300 mb-4">{user?.email}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${user?.subscriptionStatus === 'trial'
                    ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                    : 'bg-green-500/20 text-green-200 border border-green-400/30'
                  }`}>
                  {user?.subscriptionStatus === 'trial' ? `Trial • ${trialDaysLeft} days left` : 'Premium Member'}
                </span>
                <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  {onboardingData?.completedAt ? 'Onboarding Complete' : 'Setup Pending'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 mb-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
              </div>
              <p className="text-gray-900 font-medium text-lg">{user?.name}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
              </div>
              <p className="text-gray-900 font-medium text-lg">{user?.email}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-semibold text-gray-700">Subscription Status</label>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${user?.subscriptionStatus === 'trial'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
                }`}>
                {user?.subscriptionStatus === 'trial' ? 'Free Trial' : 'Premium'}
              </span>
            </div>

            {user?.subscriptionStatus === 'trial' && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <label className="text-sm font-semibold text-gray-700">Trial Period</label>
                </div>
                <p className="text-gray-900 font-medium text-lg">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} days remaining` : 'Expired'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Onboarding Responses */}
        {onboardingData && onboardingData.answers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 mb-8 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Onboarding Responses</h2>
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Responses</span>
              </button>
            </div>

            <div className="space-y-4">
              {onboardingData.answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    {getQuestionText(answer.questionId)}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {formatAnswer(answer.answer)}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-[#FFDC61]/10 border border-[#FFDC61]/30 rounded-xl">
              <p className="text-gray-700">
                <strong>🤖 AI Personalization:</strong> These responses help Daisy understand your unique needs
                and provide personalized mental health support tailored specifically for you.
              </p>
            </div>
          </motion.div>
        )}

        {/* AI Integration Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-4">Your Personalized AI Therapist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Model Status</h3>
              <p className="text-green-300 font-medium mb-2">✓ Personalized and Ready</p>
              <p className="text-sm text-purple-100">
                Your AI model has been trained with your onboarding responses
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg">Integration</h3>
              <p className="text-blue-200 font-medium mb-2">Gemini AI via Vertex AI</p>
              <p className="text-sm text-purple-100">
                Post-trained model with your personalization data
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/chat')}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
          >
            Start Conversation with Your Personalized Daisy
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <ProfilePageContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
