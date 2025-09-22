'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Settings, LogOut, Calendar, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import type { OnboardingData } from '@/shared/types/auth'

export default function DashboardPage() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!user.isOnboarded) {
      router.push('/onboarding')
      return
    }

    loadOnboardingData()
  }, [user, router])

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Daisy Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={viewProfile}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{user?.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Trial Status */}
        {user?.subscriptionStatus === 'trial' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Free Trial Active</h3>
                <p className="text-blue-700">
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} days remaining in your free trial`
                    : 'Your trial has expired'
                  }
                </p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mb-6">
            Ready to continue your mental health journey? Daisy is here to support you.
          </p>
          <button
            onClick={startChat}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Conversation with Daisy
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Sessions</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Total conversations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Streak</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Days active</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Progress</h3>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-600">Mood trend</p>
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