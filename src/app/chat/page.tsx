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
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [encouragingMessageIndex, setEncouragingMessageIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const encouragingMessages = [
    "Your therapist is carefully considering your message...",
    "Analyzing your concerns with care...",
    "Preparing a thoughtful response...",
    "Taking time to understand your feelings...",
    "Almost ready with a personalized response...",
  ]



  // Initialize or restore session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('active_chat_session')
    if (storedSessionId && !storedSessionId.startsWith('temp_')) {
      setSessionId(storedSessionId)
      console.log('Restored session:', storedSessionId)
      fetchSessionMessages(storedSessionId)
    } else {
      // Create new temp session
      const tempId = `temp_${Date.now()}`
      setSessionId(tempId)
      localStorage.setItem('active_chat_session', tempId)
      console.log('Created temporary session ID:', tempId)
    }
  }, [])

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      console.log('📥 Fetching messages for session:', sessionId)
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
          const uiMessages = data.messages.map((msg: any, idx: number) => ({
            id: msg.id || `${sessionId}_${idx}`,
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            parts: [{ type: 'text', text: msg.content || '' }],
          }))
          setMessages(uiMessages)
          console.log('✅ Loaded', uiMessages.length, 'messages from backend')
        }
      } else if (response.status === 404) {
        console.log('⚠️ Session not found in backend, starting fresh')
        setMessages([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch session messages:', error)
    }
  }

  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isLoading = isPolling

  // Track thinking time
  useEffect(() => {
    if (isLoading && !thinkingStartTime) {
      setThinkingStartTime(Date.now())
      setElapsedSeconds(0)
      setEncouragingMessageIndex(0)
    } else if (!isLoading && thinkingStartTime) {
      setThinkingStartTime(null)
      setElapsedSeconds(0)
    }
  }, [isLoading, thinkingStartTime])

  // Update elapsed time every second
  useEffect(() => {
    if (!thinkingStartTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - thinkingStartTime) / 1000)
      setElapsedSeconds(elapsed)

      // Rotate encouraging message every 10 seconds
      if (elapsed > 0 && elapsed % 10 === 0) {
        setEncouragingMessageIndex((prev) => (prev + 1) % encouragingMessages.length)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [thinkingStartTime, encouragingMessages.length])

  // No longer needed - session ID is updated in onFinish callback

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

    const messageText = inputValue
    setInputValue("")

    try {
      const token = localStorage.getItem('auth_token')
      
      // Add user message immediately to UI
      const tempUserMessage: UIMessage = {
        id: `temp_user_${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', text: messageText }],
      }
      setMessages([...messages, tempUserMessage])

      // Send message to backend
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Update session ID if needed
      const newSessionId = response.headers.get('X-Session-Id') || data.conversationId
      if (newSessionId && newSessionId !== sessionId) {
        console.log('✅ Updated session ID:', newSessionId)
        setSessionId(newSessionId)
        localStorage.setItem('active_chat_session', newSessionId)
      }

      // Start polling for response
      if (data.requestId) {
        await pollForResponse(data.requestId, token)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setInputValue(messageText)
      // Remove temp user message on error
      setMessages(messages)
    }
  }

  // Poll for async response
  const pollForResponse = async (requestId: string, token: string | null) => {
    setIsPolling(true)
    const maxAttempts = 60 // 5 minutes (5s intervals)
    let attempts = 0

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        console.error('❌ Polling timeout')
        const errorMessage: UIMessage = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          parts: [{ 
            type: 'text', 
            text: 'I apologize, but the response is taking longer than expected. Please try sending your message again.' 
          }],
        }
        setMessages(prev => [...prev, errorMessage])
        setIsPolling(false)
        return
      }

      attempts++

      try {
        console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for request:`, requestId)
        
        const response = await fetch(`/api/chat/status/${requestId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        })

        if (!response.ok) {
          console.error(`❌ Status check failed: ${response.status}`)
          throw new Error(`Status check failed: ${response.status}`)
        }

        const data = await response.json()
        console.log('📊 Poll response:', data)

        if (data.status === 'completed') {
          // Add assistant response to UI
          const assistantMessage: UIMessage = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            parts: [{ type: 'text', text: data.response }],
          }
          setMessages(prev => [...prev, assistantMessage])
          setIsPolling(false)
          console.log('✅ Response received and displayed')
          return
        }

        // Still processing, poll again after 5 seconds
        console.log('⏳ Still processing, will poll again in 5s...')
        setTimeout(poll, 5000)

      } catch (error) {
        console.error('❌ Polling error:', error)
        setTimeout(poll, 5000) // Retry on error
      }
    }

    // Start polling
    await poll()
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
                  onClick={() => {
                    setInputValue(reply)
                    textareaRef.current?.focus()
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
          {messages.map((m) => (
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
                {/* Animated typing indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[#FFDC61] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#FFDC61] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#FFDC61] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Encouraging message with fade transition */}
                <motion.p
                  key={encouragingMessageIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm text-gray-600 mb-2"
                >
                  {encouragingMessages[encouragingMessageIndex]}
                </motion.p>

                {/* Elapsed time counter */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-400">
                    Thinking... ({elapsedSeconds}s)
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FFDC61] to-[#D1E2D3]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 100,
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Timeout warning */}
                {elapsedSeconds > 60 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-amber-600 mt-2"
                  >
                    This is taking longer than usual. Please wait...
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 sm:p-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
            <div className="flex-1">
              <p className="font-medium mb-1">Error</p>
              <p>{error.message}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              ×
            </button>
          </motion.div>
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
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FFDC61] focus:border-transparent transition resize-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder={isLoading ? "Please wait for response..." : "Type your message… (Press Enter to send)"}
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
