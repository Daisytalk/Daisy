"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, LogOut, Calendar, TrendingUp, Sparkles, Brain, Heart, Target, Award, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

function DashboardPageContent() {
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500)
  }, [])

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
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 14

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Daisy</h1>
                <p className="text-xs text-gray-600">Your AI Therapist</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={viewProfile}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name}</span>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trial Status Banner */}
        {user?.subscriptionStatus === 'trial' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Free Trial Active</h3>
                </div>
                <p className="text-blue-100">
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} days remaining • Unlock unlimited access`
                    : 'Your trial has expired • Upgrade to continue'
                  }
                </p>
              </div>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg whitespace-nowrap">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 mb-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFDC61] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D1E2D3] rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Ready to continue your mental health journey? Daisy is here to support you with personalized, evidence-based conversations.
              </p>
              <button
                onClick={startChat}
                className="bg-[#FFDC61] text-black px-8 py-4 rounded-xl font-bold hover:bg-[#FFDC61]/90 transition-all shadow-lg shadow-[#FFDC61]/20 flex items-center gap-3 group"
              >
                <MessageCircle className="w-6 h-6" />
                Start Conversation with Daisy
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: MessageCircle,
              label: 'Sessions',
              value: '0',
              subtitle: 'Total conversations',
              color: 'from-green-400 to-emerald-600',
              delay: 0.1
            },
            {
              icon: Calendar,
              label: 'Streak',
              value: '0',
              subtitle: 'Days active',
              color: 'from-blue-400 to-blue-600',
              delay: 0.2
            },
            {
              icon: TrendingUp,
              label: 'Progress',
              value: '-',
              subtitle: 'Mood trend',
              color: 'from-purple-400 to-purple-600',
              delay: 0.3
            },
            {
              icon: Heart,
              label: 'Wellness',
              value: '-',
              subtitle: 'Overall score',
              color: 'from-pink-400 to-rose-600',
              delay: 0.4
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <button
            onClick={startChat}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFDC61] to-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Start Chat</h3>
            <p className="text-gray-600 text-sm">Begin a new conversation with Daisy</p>
          </button>

          <button
            onClick={viewProfile}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#D1E2D3] to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">View Profile</h3>
            <p className="text-gray-600 text-sm">Manage your account and preferences</p>
          </button>

          <button className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-left">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Set Goals</h3>
            <p className="text-gray-600 text-sm">Define your mental health objectives</p>
          </button>
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Your Personalized AI</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-2">Model Status</h4>
              <p className="text-green-600 font-medium mb-2">✓ Personalized and Ready</p>
              <p className="text-sm text-gray-600">
                Your AI model has been trained with your onboarding responses for personalized support
              </p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h4 className="font-semibold text-gray-900 mb-2">Therapeutic Approach</h4>
              <p className="text-purple-600 font-medium mb-2">CBT & DBT Integration</p>
              <p className="text-sm text-gray-600">
                Evidence-based cognitive behavioral and dialectical behavior therapy techniques
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#FFDC61]/10 border border-[#FFDC61]/30 rounded-xl">
            <p className="text-gray-700">
              <strong>💡 Tip:</strong> Regular conversations with Daisy help build better mental health habits. 
              Try to check in at least once a day for the best results.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <DashboardPageContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
