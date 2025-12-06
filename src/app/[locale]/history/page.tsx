"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ArrowLeft, Trash2, Calendar, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

interface Session {
  id: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
  persona: string
}

function HistoryPageContent() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return
    }

    setDeletingId(sessionId)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId))
        
        // If this was the active session, clear it
        const activeSession = localStorage.getItem('active_chat_session')
        if (activeSession === sessionId) {
          localStorage.removeItem('active_chat_session')
        }
      } else {
        alert('Failed to delete session')
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Failed to delete session')
    } finally {
      setDeletingId(null)
    }
  }

  const openSession = (sessionId: string) => {
    localStorage.setItem('active_chat_session', sessionId)
    router.push(`/${locale}/chat`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chat History</h1>
              <p className="text-sm text-gray-600">View and manage your conversations</p>
            </div>
          </div>
          <button
            onClick={() => {
              const tempId = `temp_${Date.now()}`
              localStorage.setItem('active_chat_session', tempId)
              router.push(`/${locale}/chat`)
            }}
            className="px-4 py-2 bg-gradient-to-br from-[#FFDC61] to-yellow-500 text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <MessageCircle className="w-10 h-10 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No conversations yet</h2>
            <p className="text-gray-600 mb-8">Start your first conversation with Daisy</p>
            <button
              onClick={() => {
                const tempId = `temp_${Date.now()}`
                localStorage.setItem('active_chat_session', tempId)
                router.push('/chat')
              }}
              className="px-6 py-3 bg-gradient-to-br from-[#FFDC61] to-yellow-500 text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Start Chatting
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => openSession(session.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-gray-900" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.id)
                      }}
                      disabled={deletingId === session.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Delete session"
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {session.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{session.messageCount} messages</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <HistoryPageContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
