"use client"

import { useChat, type UIMessage } from "@ai-sdk/react"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Bot, Loader2, ArrowLeft, Sparkles, MoreVertical, Smile } from "lucide-react"
import { useAuth } from "@/shared/hooks/useAuth"
import { useRouter } from "next/navigation"
import { DefaultChatTransport } from "ai"
import { ClientOnly } from "@/shared/components/ClientOnly"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"

function ChatPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async () => {
        // Get token from cookie
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1]

        return {
          'Authorization': `Bearer ${token || ''}`,
        }
      },
    }),
  })

  const isLoading = status === "streaming"

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const textFrom = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  const quickReplies = [
    "I'm feeling anxious today",
    "Can we talk about stress?",
    "I need some motivation",
    "Help me with my thoughts"
  ]

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#D1E2D3]/20 via-white to-[#FFDC61]/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 p-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
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
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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
                    sendMessage({ text: reply })
                  }}
                  className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#FFDC61] transition-all text-left group"
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
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 sm:p-6">
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
            <button
              type="button"
              className="absolute right-3 bottom-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
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
