"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Settings, LogOut, Calendar, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import type { OnboardingData } from '@/shared/types/auth'
import { ClientOnly } from '@/shared/components/ClientOnly'

function DashboardPageContent() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    if (user) {
      loadOnboardingData()
    }
  }, [user])

  const loadOnboardingData = async () => {
    if (!user) return

    try {
      const data = await onboardingService.getOnboardingData(user.id)
      setOnboardingData(data)
    } catch (error) {
      console.error('Failed to load onboarding data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const startChat = () => {
    router.push('/chat')
  }

  const viewProfile = () => {
    router.push('/profile')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Daisy Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={viewProfile}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 sm:p-0"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm sm:text-base">{user?.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-red-600 transition-colors p-2 sm:p-0"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm sm:text-base">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Trial Status */}
        {user?.subscriptionStatus === 'trial' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Free Trial Active</h3>
                <p className="text-blue-700 text-sm sm:text-base">
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} days remaining in your free trial`
                    : 'Your trial has expired'
                  }
                </p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Ready to continue your mental health journey? Daisy is here to support you.
          </p>
          <button
            onClick={startChat}
            className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Start Conversation with Daisy
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Sessions</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs sm:text-sm text-gray-600">Total conversations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Streak</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs sm:text-sm text-gray-600">Days active</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Progress</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs sm:text-sm text-gray-600">Mood trend</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Onboarding Summary */}
        {onboardingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Profile Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {onboardingData.answers.map((answer, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-900">Question {index + 1}</p>
                  <p className="text-gray-600">
                    {Array.isArray(answer.answer)
                      ? answer.answer.join(', ')
                      : String(answer.answer)
                    }
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={viewProfile}
              className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
            >
              View Full Profile →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ClientOnly>
      <DashboardPageContent />
    </ClientOnly>
  )
}
