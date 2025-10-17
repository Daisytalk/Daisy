"use client"

import { useChat, type UIMessage } from "@ai-sdk/react"
import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Loader2, ArrowLeft, Sparkles, Smile, X } from "lucide-react"
import { useAuth } from "@/shared/hooks/useAuth"
import { useRouter } from "next/navigation"
import { ClientOnly } from "@/shared/components/ClientOnly"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"

// Simple emoji picker data
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'],
  'Emotions': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'],
  'Symbols': ['✨', '⭐', '🌟', '💫', '✅', '❌', '⚠️', '🔥', '💯', '🎯', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️']
}

function ChatPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Create custom transport with auth headers and session ID
  const transport = useMemo(() => {
    const { TextStreamChatTransport } = require('ai')
    return new TextStreamChatTransport({
      headers: () => {
        const token = localStorage.getItem('auth_token')
        return {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      },
      body: () => ({
        sessionId: sessionId,
      }),
    })
  }, [sessionId])

  // Initialize or restore session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('active_chat_session')
    if (storedSessionId && !storedSessionId.startsWith('temp_')) {
      setSessionId(storedSessionId)
      console.log('Restored session:', storedSessionId)
      // Fetch session messages from backend
      fetchSessionMessages(storedSessionId)
    } else {
      // For new sessions, we'll let the backend create it on first message
      const tempId = `temp_${Date.now()}`
      setSessionId(tempId)
      localStorage.setItem('active_chat_session', tempId)
      console.log('Created temporary session ID:', tempId)
    }
  }, [])

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/cbt/conversations/${sessionId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.messages && Array.isArray(data.messages)) {
          // Convert CBT message format to UIMessage format
          const uiMessages = data.messages.map((msg: any, index: number) => ({
            id: `${sessionId}_${index}`,
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            parts: [{ type: 'text', text: msg.content || '' }],
          }))
          setMessages(uiMessages)
          console.log('Loaded', uiMessages.length, 'messages from backend')
        }
      } else if (response.status === 404) {
        // Session not found, clear it and start fresh
        console.log('Session not found, starting new session')
        localStorage.removeItem('active_chat_session')
        const tempId = `temp_${Date.now()}`
        setSessionId(tempId)
        localStorage.setItem('active_chat_session', tempId)
      }
    } catch (error) {
      console.error('Failed to fetch session messages:', error)
      // On error, start fresh
      localStorage.removeItem('active_chat_session')
      const tempId = `temp_${Date.now()}`
      setSessionId(tempId)
      localStorage.setItem('active_chat_session', tempId)
    }
  }

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: sessionId || undefined,
    transport,
    onError: (error) => {
      console.error('❌ Chat error:', error)
    },
    onFinish: (message, response) => {
      console.log('✅ Message finished:', message)

      // Update session ID from response headers if we had a temp session
      if (sessionId?.startsWith('temp_') && response?.headers) {
        const realSessionId = response.headers.get('X-Session-Id')
        if (realSessionId && realSessionId !== sessionId) {
          console.log('Updating to real session ID from header:', realSessionId)
          setSessionId(realSessionId)
          localStorage.setItem('active_chat_session', realSessionId)
        }
      }
    },
  })

  const isLoading = status === 'streaming'

  // Start new chat session
  const startNewChat = () => {
    const tempId = `temp_${Date.now()}`
    setSessionId(tempId)
    setMessages([])
    localStorage.setItem('active_chat_session', tempId)
    console.log('Started new chat session:', tempId)
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Extract text content from message
  const textFrom = (m: UIMessage) => {
    if (!m.parts || m.parts.length === 0) {
      console.warn('Message has no parts:', m)
      return ''
    }
    const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")
    console.log('Extracted text from message:', text.substring(0, 50) + '...')
    return text
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Send message (auth header is handled by transport)
    // Session ID will be updated in onFinish callback from response headers
    await sendMessage({ text: inputValue })

    setInputValue("")
  }

  const handleEmojiSelect = useCallback((emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = inputValue
    const before = text.substring(0, start)
    const after = text.substring(end)

    setInputValue(before + emoji + after)
    setShowEmojiPicker(false)

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + emoji.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }, [inputValue])

  const quickReplies = [
    "I'm feeling anxious today",
    "Can we talk about stress?",
    "I need some motivation",
    "Help me with my thoughts"
  ]

  return (
    <div className="flex-col items-center justify-center h-screen mx-auto bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 p-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Daisy</h1>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online & Ready
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/history')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="View history"
          >
            History
          </button>
          <button
            onClick={startNewChat}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Start new chat"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 mx-auto max-w-7xl items-center justify-center overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-gray-900" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hi {user?.name}! I'm Daisy 👋
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your personalized AI therapist is here to support you. How are you feeling today?
            </p>

            {/* Quick Reply Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {quickReplies.map((reply, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={async () => {
                    // Send message directly (auth header is handled by transport)
                    await sendMessage({ text: reply })
                  }}
                  disabled={isLoading}
                  className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#FFDC61] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-gray-700 group-hover:text-gray-900 font-medium">{reply}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((m, index) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 sm:gap-4 ${m.role === "user" ? "justify-end" : "justify-start"} max-w-4xl ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
            >
              {m.role === "assistant" && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-xl p-4 sm:p-5 rounded-2xl shadow-lg ${m.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                  }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{textFrom(m)}</p>
                <p className={`text-xs mt-2 ${m.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {m.role === "user" && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg text-lg">
                  {user?.name?.charAt(0).toUpperCase() || <User size={24} />}
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 sm:gap-4 justify-start max-w-4xl"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FFDC61] to-[#D1E2D3] flex items-center justify-center flex-shrink-0 shadow-lg">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-900" />
              </div>
              <div className="max-w-xl p-4 sm:p-5 rounded-2xl shadow-lg bg-white text-gray-800 rounded-bl-none border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 sm:p-6">
        {error && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            An error occurred: {error.message}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex gap-3 items-end"
        >
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
              className="w-full pl-4 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition resize-none bg-white"
              placeholder="Type your message… (Press Enter to send)"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Pick an emoji</h3>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Close emoji picker"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
                      <div className="grid grid-cols-10 gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-14 h-14 bg-gradient-to-br from-[#FFDC61] to-yellow-500 text-gray-900 rounded-2xl flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#FFDC61]/20 disabled:shadow-none"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-4">
          Daisy uses AI to provide support. Always consult a professional for serious concerns.
        </p>
      </footer>
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
