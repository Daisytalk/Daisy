'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLocale, useTranslations } from 'next-intl'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import { TypewriterText } from '@/shared/ui/typewriter-text'
import { PremiumBanner } from '@/shared/components/PremiumBanner'
import { FloatingDaisy } from '@/shared/components/chat/FloatingDaisy'

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
  const locale = useLocale()
  const searchParams = useSearchParams()
  const t = useTranslations('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingRevealedId, setStreamingRevealedId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const paymentRecordedRef = useRef<string | null>(null)

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

  // «Новый чат» из сайдбара: ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      const tempId = `temp_${Date.now()}`
      setSessionId(tempId)
      setMessages([])
      localStorage.setItem('active_chat_session', tempId)
      window.history.replaceState(null, '', `/${locale}/chat`)
    }
  }, [searchParams, locale])

  // Возврат с Freedom Pay: ?payment_id=…&amount_minor=…&currency=…
  useEffect(() => {
    const pid = searchParams.get('payment_id')
    const am = searchParams.get('amount_minor')
    if (!pid || !am) return
    if (paymentRecordedRef.current === pid) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    const amountMinor = parseInt(am, 10)
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) return

    const cur = searchParams.get('currency') || 'USD'
    paymentRecordedRef.current = pid

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/payments/record-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId: pid,
            amountMinor,
            currency: cur,
          }),
        })
        if (cancelled) return
        if (!res.ok) {
          paymentRecordedRef.current = null
          return
        }
        window.history.replaceState(null, '', `/${locale}/chat`)
      } catch {
        paymentRecordedRef.current = null
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, locale])

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
          locale: locale,
        }),
      })

      if (!response.ok) {
        if (response.status === 402) {
          const errData = await response.json().catch(() => ({}))
          setMessages(prev => [...prev, {
            id: `trial_${Date.now()}`,
            role: 'assistant',
            content: (errData.error as string) || 'Пробный период истёк. Выберите план для продолжения.',
            timestamp: new Date(),
          }])
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

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
        content: "Something went wrong on our side. Please try sending your message again-if it keeps happening, we're likely fixing the service.",
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

    while (attempts < maxAttempts) {
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
            content: "Something went wrong on our side. Please try sending your message again-if it keeps happening, we're likely fixing the service.",
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
            content = "Something went wrong on our side. Please try sending your message again-if it keeps happening, we're likely fixing the service."
          }
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content,
            timestamp: new Date(),
            stream: true,
          }
          setMessages(prev => [...prev, assistantMessage])
          // Не ставим streamingRevealedId здесь — покажем «думает» до первого символа typewriter
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

        // Still processing; wait before polling again
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
      } catch (error) {
        console.error('Polling error:', error)
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: "Something went wrong on our side. Please try sending your message again-if it keeps happening, we're likely fixing the service.",
          timestamp: new Date(),
        }])
        return
      }
    }

    // Max attempts reached
    const errorMessage: Message = {
      id: `error_${Date.now()}`,
      role: 'assistant',
      content: 'The response is taking longer than expected. Please try again in a moment.',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, errorMessage])
  }

  const suggestedPrompts = [
    "Мне тревожно сегодня",
    "Давай поговорим о стрессе",
    "Мне нужна мотивация",
    "Помоги разобраться в мыслях"
  ]

  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-0 relative bg-[hsl(var(--app-bg))]">
        {/* Фон с ромашкой (cabinet.png): чуть уменьшен и прижат к правому низу, чтобы ромашка влезала */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <Image
            src="/images/cabinet.png"
            alt=""
            fill
            className="object-cover object-right-bottom opacity-[0.22] min-w-[120%] min-h-[120%] w-[120%] h-[120%] -translate-x-[8%] -translate-y-[8%]"
            priority
            aria-hidden
          />
        </div>
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center pt-8 sm:pt-16 relative"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-6 shadow-lg ring-4 ring-white/80 flex items-center justify-center bg-white">
                  <Image
                    src="/images/daisy-icon.svg"
                    alt="Daisy"
                    width={112}
                    height={112}
                    className="object-contain max-w-[5rem] max-h-[5rem] sm:max-w-[6rem] sm:max-h-[6rem]"
                    priority
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
                  {user?.name?.split(' ')[0] || 'there'}, привет!
                </h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Как ты себя чувствуешь сегодня? Напиши мне или выбери тему ниже.
                </p>
                <div className="flex flex-wrap justify-center gap-2 w-full max-w-xl">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setInputValue(prompt)}
                      className="px-4 py-2.5 rounded-2xl border-2 border-[hsl(var(--app-border))] bg-white/90 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 text-sm font-medium text-foreground transition-colors"
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
                        <Avatar className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden bg-white border border-[hsl(var(--app-border))]">
                          <AvatarImage src="/images/daisy-icon.svg" alt="Daisy" className="object-contain p-1" />
                          <AvatarFallback className="bg-primary text-primary-foreground rounded-full text-xs">D</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[420px] min-w-0 rounded-2xl px-4 py-3 min-h-[44px] break-words overflow-hidden ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-primary text-primary-foreground'
                            : 'rounded-bl-md bg-white border border-[hsl(var(--app-border))] shadow-sm'
                        }`}
                      >
                        {message.role === 'assistant' && message.stream ? (
                          <div className="relative min-h-[28px]">
                            <motion.div
                              className={streamingRevealedId === message.id ? 'relative' : 'absolute inset-0 pointer-events-none'}
                              initial={false}
                              animate={{ opacity: streamingRevealedId === message.id ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                              aria-hidden={streamingRevealedId !== message.id}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                <TypewriterText
                                  text={message.content}
                                  speedMs={10}
                                  onFirstChar={() => {
                                    setStreamingRevealedId(message.id)
                                    setIsLoading(false)
                                  }}
                                  onComplete={() => {
                                    setStreamingRevealedId(mid => mid ?? message.id)
                                    setIsLoading(false)
                                    setMessages(prev => prev.map(m => m.id === message.id ? { ...m, stream: false } : m))
                                  }}
                                />
                              </p>
                            </motion.div>
                            <AnimatePresence>
                              {streamingRevealedId !== message.id && (
                                <motion.div
                                  key="thinking"
                                  className="absolute inset-0 flex items-center gap-3"
                                  initial={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  aria-live="polite"
                                  aria-label={t('thinking')}
                                >
                                  <Image
                                    src="/images/daisy_morph_spin.svg"
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="shrink-0 w-8 h-8"
                                    aria-hidden
                                  />
                                  <span className="text-sm text-muted-foreground">{t('thinking')}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                          <AvatarImage src="/images/user-icon.png" alt="Вы" className="object-cover" />
                          <AvatarFallback className="bg-muted text-muted-foreground rounded-full text-xs font-medium">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (() => {
                  const lastMsg = messages[messages.length - 1]
                  const lastIsStreamingAssistant = lastMsg?.role === 'assistant' && lastMsg?.stream
                  if (lastIsStreamingAssistant) return null
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                      aria-live="polite"
                      aria-label={t('thinking')}
                    >
                      <Avatar className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden bg-white border border-[hsl(var(--app-border))]">
                        <AvatarImage src="/images/daisy-icon.svg" alt="Daisy" className="object-contain p-1" />
                        <AvatarFallback className="bg-primary/90 text-primary-foreground rounded-full text-xs">D</AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl rounded-bl-md bg-white border border-[hsl(var(--app-border))] shadow-sm px-4 py-3 flex items-center gap-3">
                        <Image
                          src="/images/daisy_morph_spin.svg"
                          alt=""
                          width={32}
                          height={32}
                          className="shrink-0 w-8 h-8"
                          aria-hidden
                        />
                        <span className="text-sm text-muted-foreground">{t('thinking')}</span>
                      </div>
                    </motion.div>
                  )
                })()}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 sm:p-6 relative z-10 bg-[hsl(var(--app-bg))]/60 backdrop-blur-sm">
          <PremiumBanner />
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
                disabled={isLoading || !inputValue.trim() || inputValue.length > 10000}
                className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            {inputValue.length > 3000 && (
              <p className="mt-1 text-center">
                <span
                  className={
                    inputValue.length > 10000
                      ? 'text-red-500 text-xs'
                      : 'text-yellow-500 text-xs'
                  }
                >
                  {inputValue.length.toLocaleString()} / {(10000).toLocaleString()}
                </span>
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground text-center" role="note">
              {t('disclaimer')}
            </p>
          </form>
        </div>
        {user?.name && <FloatingDaisy userName={user.name} />}
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
