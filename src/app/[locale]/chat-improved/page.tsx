'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Plus, Settings, Share2, Paperclip, Mic } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { useSendMessage, useMessageStatus, useConversation } from '@/features/chat/model/useChat'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function ChatPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessageMutation = useSendMessage()
  const { data: statusData } = useMessageStatus(currentRequestId, !!currentRequestId)
  const { data: conversationData } = useConversation(sessionId)

  useEffect(() => {
    const storedSessionId = localStorage.getItem('active_chat_session')
    if (storedSessionId && !storedSessionId.startsWith('temp_')) {
      setSessionId(storedSessionId)
    } else {
      const tempId = `temp_${Date.now()}`
      setSessionId(tempId)
      localStorage.setItem('active_chat_session', tempId)
    }
  }, [])

  useEffect(() => {
    if (conversationData?.messages) {
      const loadedMessages = conversationData.messages.map((msg) => ({
        id: msg.id,
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }))
      setMessages(loadedMessages)
    }
  }, [conversationData])

  useEffect(() => {
    if (statusData?.status === 'completed' && statusData.response) {
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: statusData.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setCurrentRequestId(null)
      toast.success('Response received')
    } else if (statusData?.status === 'failed') {
      toast.error('Failed to get response')
      setCurrentRequestId(null)
    }
  }, [statusData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || sendMessageMutation.isPending) return

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
      const result = await sendMessageMutation.mutateAsync({
        messages: [{ role: 'user', content: messageText }],
        sessionId: sessionId,
      })

      if (result.conversationId && result.conversationId !== sessionId) {
        setSessionId(result.conversationId)
        localStorage.setItem('active_chat_session', result.conversationId)
      }

      setCurrentRequestId(result.requestId)
    } catch (error) {
      setInputValue(messageText)
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
    }
  }

  const startNewChat = () => {
    const tempId = `temp_${Date.now()}`
    setSessionId(tempId)
    setMessages([])
    setCurrentRequestId(null)
    localStorage.setItem('active_chat_session', tempId)
  }

  const suggestedPrompts = [
    "What are the key benefits of Product 1 that I should highlight to potential clients?",
    "Answer RFP documentation",
    "Conduct a competitor analysis",
    "Provide feedback on communication"
  ]

  const quickActions = [
    { icon: '📅', label: 'Connect Calendar', color: 'bg-red-50 text-red-600' },
    { icon: '✓', label: 'Demo Task', color: 'bg-blue-50 text-blue-600' },
    { icon: '🔗', label: 'Browse Integrations', color: 'bg-orange-50 text-orange-600' },
    { icon: '📝', label: 'Shared in Notes', color: 'bg-green-50 text-green-600' },
  ]

  const isLoading = sendMessageMutation.isPending || !!currentRequestId

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1" />
        <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600">
          <Settings className="w-5 h-5" />
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Daisy</h1>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">Plus</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={startNewChat}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                    Hi, there 👋
                  </h2>
                  <p className="text-gray-600">
                    Tell us what you need, and we'll handle the rest.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(prompt)}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left text-sm text-gray-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 ${action.color} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2`}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[70%] ${message.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'} rounded-2xl px-4 py-3`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-700">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm disabled:bg-gray-50"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              Daisy may display inaccurate info, so please double check the response.{' '}
              <button type="button" className="underline hover:text-gray-700">Your Privacy</button> & <button type="button" className="underline hover:text-gray-700">Daisy GPT</button>
            </p>
          </form>
        </footer>
      </div>
    </div>
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
