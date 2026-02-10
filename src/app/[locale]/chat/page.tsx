'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Paperclip, Mic } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLocale, useTranslations } from 'next-intl'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Card } from '@/shared/ui/card'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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

  const POLL_INTERVAL_MS = 1500

  const pollForResponse = async (requestId: string, token: string | null) => {
    const maxAttempts = 80 // ~2 min at 1.5s
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
          }
          setMessages(prev => [...prev, assistantMessage])
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
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 py-12"
              >
                <div className="w-20 h-20 rounded-app-lg bg-primary shadow-app flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>

                <div>
                  <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
                    Hi {user?.name}! 👋
                  </h2>
                  <p className="text-muted-foreground">
                    How are you feeling today?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer rounded-app border-app-border hover:border-primary/30 hover:shadow-app transition-all bg-app-surface"
                      onClick={() => setInputValue(prompt)}
                    >
                      <p className="text-sm text-foreground">{prompt}</p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="flex-shrink-0 h-9 w-9 rounded-app">
                        <AvatarFallback className="bg-primary text-primary-foreground rounded-app">
                          <Sparkles className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card className={`max-w-[75%] rounded-app-lg border-app-border shadow-app ${message.role === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-app-surface'}`}>
                      <div className="p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </Card>
                    {message.role === 'user' && (
                      <Avatar className="flex-shrink-0 h-9 w-9 rounded-app">
                        <AvatarFallback className="bg-app-border text-muted-foreground rounded-app text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
                aria-live="polite"
                aria-label={t('thinking')}
              >
                <Avatar className="flex-shrink-0 h-9 w-9 rounded-app">
                  <AvatarFallback className="bg-primary/90 text-primary-foreground rounded-app">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-[75%] rounded-app-lg border-app-border bg-app-surface shadow-app">
                  <div className="p-4 flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{t('thinking')}</span>
                  </div>
                </Card>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-app-border bg-app-surface p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
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
                  className="resize-none min-h-[48px] max-h-[120px] rounded-app border-app-border bg-app-bg"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-12 rounded-app px-5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center max-w-3xl mx-auto" role="note">
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
