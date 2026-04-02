'use client'

import { useEffect, useState, useMemo } from 'react'
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

function groupSessionsByDate(sessions: Session[], t: (key: string) => string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const groups: { label: string; sessions: Session[] }[] = [
    { label: t('groups.today'), sessions: [] },
    { label: t('groups.yesterday'), sessions: [] },
    { label: t('groups.thisWeek'), sessions: [] },
    { label: t('groups.earlier'), sessions: [] },
  ]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  sessions.forEach((s) => {
    const d = new Date(s.updatedAt)
    if (d >= today) groups[0].sessions.push(s)
    else if (d >= yesterday) groups[1].sessions.push(s)
    else if (d >= weekAgo) groups[2].sessions.push(s)
    else groups[3].sessions.push(s)
  })

  return groups.filter((g) => g.sessions.length > 0)
}

function HistoryPageContent() {
  const t = useTranslations('history')
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const locale = useLocale()

  const groupedSessions = useMemo(() => groupSessionsByDate(sessions, t), [sessions, t])

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return t('time.justNow')
    if (diffMins < 60) return t('time.minutesAgo', { n: diffMins })
    if (diffHours < 24) return t('time.hoursAgo', { n: diffHours })
    if (diffDays < 7) return t('time.daysAgo', { n: diffDays })
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col min-h-0 bg-[#fafafa]">
        <div className="shrink-0 px-4 sm:px-6 py-5 bg-white border-b border-[#eee]">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-semibold text-[#1a1a1a]">{t('title')}</h1>
              <p className="text-[14px] text-[#6b6b6b] mt-0.5">{t('subtitle')}</p>
            </div>
            <button
              onClick={startNewChat}
              className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#5ba3c6] text-white text-[14px] font-medium hover:bg-[#4a8fb3] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('newChat')}
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-auto min-h-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#5ba3c6]" />
              </div>
            ) : sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-20"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#e0f7fa] flex items-center justify-center mb-5">
                  <MessageCircle className="w-7 h-7 text-[#5ba3c6]" />
                </div>
                <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">{t('emptyTitle')}</h2>
                <p className="text-[15px] text-[#6b6b6b] mb-6 max-w-sm">{t('emptyDesc')}</p>
                <button
                  onClick={startNewChat}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#5ba3c6] text-white font-medium hover:bg-[#4a8fb3] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('startChatting')}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {groupedSessions.map((group) => (
                  <div key={group.label}>
                    <p className="text-[12px] font-medium text-[#8e8e8e] uppercase tracking-wider mb-3 px-1">
                      {group.label}
                    </p>
                    <ul className="space-y-1">
                      <AnimatePresence>
                        {group.sessions.map((session, index) => (
                          <motion.li
                            key={session.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ delay: index * 0.02 }}
                            className="group flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#e5e5e5] hover:shadow-sm"
                            onClick={() => openSession(session.id)}
                          >
                            <div className="w-9 h-9 rounded-lg bg-[#e0f7fa] flex items-center justify-center shrink-0">
                              <MessageCircle className="w-4 h-4 text-[#5ba3c6]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-medium text-[#2d2d2d] truncate group-hover:text-[#5ba3c6] transition-colors">
                                {session.title}
                              </h3>
                              <p className="text-[13px] text-[#8e8e8e]">
                                {t('messageCount', { count: session.messageCount })} · {formatTime(session.updatedAt)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSession(session.id)
                              }}
                              disabled={deletingId === session.id}
                              className="p-2 rounded-lg text-[#8e8e8e] hover:text-[#e57373] hover:bg-[#fef2f2] opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
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
                  </div>
                ))}
              </div>
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
