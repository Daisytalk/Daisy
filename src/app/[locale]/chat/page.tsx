'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Paperclip, Mic } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLocale } from 'next-intl'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'
import { Button } from '@/shared/ui/ui/button'
import { Textarea } from '@/shared/ui/ui/textarea'
import { Card } from '@/shared/ui/ui/card'
import { Avatar, AvatarFallback } from '@/shared/ui/ui/avatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function ChatPageContent() {
  const { user } = useAuth()
  const locale = useLocale()
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
          const loadedMessages = data.messages.map((msg: any) => ({
            id: msg.id || `${sessionId}_${Date.now()}`,
            role: msg.role === 'assistant' ? 'assistant' : 'user',
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
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setInputValue(messageText)
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const pollForResponse = async (requestId: string, token: string | null) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but the response is taking longer than expected. Please try again.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
        return
      }

      attempts++

      try {
        const response = await fetch(`/api/chat/status/${requestId}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        })

        if (!response.ok) throw new Error(`Status check failed: ${response.status}`)

        const data = await response.json()

        if (data.status === 'completed') {
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
          return
        }

        setTimeout(poll, 5000)
      } catch (error) {
        console.error('Polling error:', error)
        setTimeout(poll, 5000)
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                    Hi {user?.name}! 👋
                  </h2>
                  <p className="text-gray-600">
                    How are you feeling today?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                      onClick={() => setInputValue(prompt)}
                    >
                      <p className="text-sm text-gray-700">{prompt}</p>
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
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                          <Sparkles className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card className={`max-w-[70%] ${message.role === 'user' ? 'bg-gray-900 text-white border-gray-900' : ''}`}>
                      <div className="p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </Card>
                    {message.role === 'user' && (
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className="bg-gray-200 text-gray-700">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <Avatar className="flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <Card>
                  <div className="p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
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
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="resize-none min-h-[48px] max-h-[120px]"
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
                className="h-12"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
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
