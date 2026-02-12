'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLocale, useTranslations } from 'next-intl'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { TypewriterText } from '@/shared/ui/typewriter-text'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  /** When true, assistant message is revealed with typewriter effect */
  stream?: boolean
}

function ChatPageContent() {
  const { user } = useAuth()
  const t = useTranslations('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedSessionId = localStorage.getItem('active_chat_session')
    if (storedSessionId && !storedSessionId.startsWith('temp_')) {
      setSessionId(storedSessionId)
      fetchSessionMessages(storedSessionId)
    } else {
      const tempId = `temp_${Date.now()}`
      setSessionId(tempId)
      localStorage.setItem('active_chat_session', tempId)
    }
  }, [])

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/cbt/conversations/${sessionId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.messages && Array.isArray(data.messages)) {
          const loadedMessages = data.messages.map((msg: { id?: string; role: string; content?: string; createdAt?: string }) => ({
            id: msg.id || `${sessionId}_${Date.now()}`,
            role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: msg.content || '',
            timestamp: new Date(msg.createdAt || Date.now()),
          }))
          setMessages(loadedMessages)
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const messageText = inputValue
    setInputValue('')

    const tempUserMessage: Message = {
      id: `temp_user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: messageText }],
          sessionId: sessionId,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      
      const newSessionId = response.headers.get('X-Session-Id') || data.conversationId
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId)
        localStorage.setItem('active_chat_session', newSessionId)
      }

      if (data.requestId) {
        await pollForResponse(data.requestId, token)
      } else {
        // No requestId (unexpected); show error in thread
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: "Something went wrong on our side. Please try sending your message again.",
          timestamp: new Date(),
        }])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setInputValue(messageText)
      // Keep user message in thread; add error bubble so it doesn't look like the message "disappeared"
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "Something went wrong on our side. Please try sending your message again—if it keeps happening, we're likely fixing the service.",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const POLL_INTERVAL_MS = 3000

  const pollForResponse = async (requestId: string, token: string | null) => {
    const maxAttempts = 45 // ~2.25 min at 3s
    let attempts = 0

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: 'The response is taking longer than expected. Please try again in a moment.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
        return
      }

      attempts++

      try {
        const response = await fetch(`/api/chat/status/${requestId}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          credentials: 'include',
        })

        if (!response.ok) {
          const errText = await response.text()
          console.error('Status check failed:', response.status, errText)
          setMessages(prev => [...prev, {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: "Something went wrong on our side. Please try sending your message again—if it keeps happening, we're likely fixing the service.",
            timestamp: new Date(),
          }])
          return
        }

        let data: { status?: string; response?: string; protocol?: string; errorMessage?: string }
        try {
          data = await response.json()
        } catch {
          setMessages(prev => [...prev, {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: "Something went wrong on our side. Please try again.",
            timestamp: new Date(),
          }])
          return
        }

        if (data.status === 'completed') {
          let content = data.response ?? ''
          const isBackendError = data.protocol === 'error'
          if (isBackendError) {
            content = "Something went wrong on our side. Please try sending your message again—if it keeps happening, we're likely fixing the service."
          }
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content,
            timestamp: new Date(),
            stream: true,
          }
          setMessages(prev => [...prev, assistantMessage])
          await new Promise(r => setTimeout(r, 300))
          return
        }

        if (data.status === 'failed') {
          const errorMessage: Message = {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: data.errorMessage || 'Something went wrong. Please try again.',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, errorMessage])
          return
        }

        // Still processing; poll again after a short interval
        setTimeout(poll, POLL_INTERVAL_MS)
      } catch (error) {
        console.error('Polling error:', error)
        // Don't throw: add error to thread so user message stays visible
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: "Something went wrong on our side. Please try sending your message again—if it keeps happening, we're likely fixing the service.",
          timestamp: new Date(),
        }])
      }
    }

    await poll()
  }

  const suggestedPrompts = [
    "I'm feeling anxious today",
    "Can we talk about stress?",
    "I need some motivation",
    "Help me with my thoughts"
  ]

  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-0 bg-[hsl(var(--app-bg))]">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center pt-8 sm:pt-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
                  Hi {user?.name?.split(' ')[0] || 'there'} 👋
                </h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  How are you feeling today? Start the conversation below or pick a prompt.
                </p>
                <div className="flex flex-wrap justify-center gap-2 w-full max-w-xl">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setInputValue(prompt)}
                      className="px-4 py-2.5 rounded-2xl border-2 border-[hsl(var(--app-border))] bg-white hover:border-primary/40 hover:bg-primary/5 text-sm font-medium text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="flex-shrink-0 h-8 w-8 rounded-xl">
                          <AvatarFallback className="bg-primary text-primary-foreground rounded-xl">
                            <Sparkles className="w-3.5 h-3.5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[420px] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-primary text-primary-foreground'
                            : 'rounded-bl-md bg-white border border-[hsl(var(--app-border))] shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.role === 'assistant' && message.stream ? (
                            <TypewriterText
                              text={message.content}
                              speedMs={10}
                              onComplete={() => {
                                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, stream: false } : m))
                              }}
                            />
                          ) : (
                            message.content
                          )}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="flex-shrink-0 h-8 w-8 rounded-xl">
                          <AvatarFallback className="bg-muted text-muted-foreground rounded-xl text-xs font-medium">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                    aria-live="polite"
                    aria-label={t('thinking')}
                  >
                    <Avatar className="flex-shrink-0 h-8 w-8 rounded-xl">
                      <AvatarFallback className="bg-primary/90 text-primary-foreground rounded-xl">
                        <Sparkles className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl rounded-bl-md bg-white border border-[hsl(var(--app-border))] shadow-sm px-4 py-3 flex items-center gap-3">
                      <motion.span
                        className="text-2xl leading-none"
                        animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.3 }}
                        role="img"
                        aria-hidden
                      >
                        🤔
                      </motion.span>
                      <span className="text-sm text-muted-foreground">{t('thinking')}</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 sm:p-6 bg-[hsl(var(--app-bg))]">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 p-2 rounded-2xl bg-white border-2 border-[hsl(var(--app-border))] shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder={t('placeholder')}
                disabled={isLoading}
                className="min-h-[48px] max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 rounded-xl"
                rows={1}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-11 w-11 shrink-0 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center" role="note">
              {t('disclaimer')}
            </p>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}

export default function ChatPage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <ChatPageContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
