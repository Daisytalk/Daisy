'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Trash2, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'

interface Session {
  id: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
  persona: string
}

function HistoryPageContent() {
  const t = useTranslations('history')
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/sessions', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
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
    if (!confirm('Are you sure you want to delete this conversation?')) return
    setDeletingId(sessionId)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId))
        if (localStorage.getItem('active_chat_session') === sessionId) {
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

  const startNewChat = () => {
    const tempId = `temp_${Date.now()}`
    localStorage.setItem('active_chat_session', tempId)
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
    <AppLayout>
      <div className="h-full flex flex-col bg-[hsl(var(--app-bg))]">
        <div className="shrink-0 border-b border-[hsl(var(--app-border))] bg-white px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
            </div>
            <button
              onClick={startNewChat}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition-opacity shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t('newChat')}
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{t('emptyTitle')}</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">{t('emptyDesc')}</p>
                <button
                  onClick={startNewChat}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-95"
                >
                  <Plus className="w-4 h-4" />
                  {t('startChatting')}
                </button>
              </motion.div>
            ) : (
              <ul className="space-y-0">
                <AnimatePresence>
                  {sessions.map((session, index) => (
                    <motion.li
                      key={session.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className="group flex items-center gap-4 py-4 px-4 rounded-2xl hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-[hsl(var(--app-border))]"
                      onClick={() => openSession(session.id)}
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {session.messageCount} messages · {formatDate(session.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                        disabled={deletingId === session.id}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deletingId === session.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
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
