"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Save, X } from 'lucide-react'
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
  const [isEditing, setIsEditing] = useState(false)
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
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user?.subscriptionStatus === 'trial'
                ? 'bg-blue-100 text-blue-800'
                : user?.subscriptionStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {user?.subscriptionStatus === 'trial' ? 'Free Trial' : user?.subscriptionStatus}
              </span>
            </div>
            {user?.subscriptionStatus === 'trial' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trial Ends</label>
                <p className="text-gray-900 font-medium">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} days remaining` : 'Expired'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Onboarding Responses */}
        {onboardingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Onboarding Responses</h2>
              <p className="text-sm text-gray-600">
                Completed on {new Date(onboardingData.completedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-6">
              {onboardingData.answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-blue-500 pl-6 py-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getQuestionText(answer.questionId)}
                  </h3>
                  <p className="text-gray-700 text-lg">
                    {formatAnswer(answer.answer)}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>AI Personalization:</strong> These responses help Daisy understand your unique needs
                and provide personalized mental health support tailored specifically for you.
              </p>
            </div>
          </motion.div>
        )}

        {/* AI Model Integration Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Personalized AI Therapist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Model Status</h3>
              <p className="text-green-600 font-medium">✓ Personalized and Ready</p>
              <p className="text-sm text-gray-600 mt-1">
                Your AI model has been trained with your onboarding responses
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Integration</h3>
              <p className="text-blue-600 font-medium">Gemini AI via Vertex AI</p>
              <p className="text-sm text-gray-600 mt-1">
                Post-trained model with your personalization data
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/chat')}
            className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
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
