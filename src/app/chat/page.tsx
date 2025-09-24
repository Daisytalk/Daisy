"use client"

import { useChat, type UIMessage } from "@ai-sdk/react"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Bot, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/shared/hooks/useAuth"
import { useRouter } from "next/navigation"
import { DefaultChatTransport } from "ai"

export default function ChatPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  /* ========== AI SDK v5 API ========== */
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isLoading = status === "streaming"

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login")
  }, [user, isAuthLoading, router])

  if (isAuthLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  const textFrom = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Bot className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Daisy</h1>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  D
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-2xl shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{textFrom(m)}</p>
              </div>
              {m.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                  {user?.name?.charAt(0) || <User size={24} />}
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 justify-start"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="max-w-xl p-4 rounded-2xl shadow-sm bg-white text-gray-800 rounded-bl-none">
                <p>Daisy is thinking…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t p-4">
        {error && <div className="text-red-500 text-sm mb-2 text-center">An error occurred: {error.message}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const message = formData.get("message") as string
            if (message.trim()) {
              sendMessage({ text: message })
              e.currentTarget.reset()
            }
          }}
          className="max-w-4xl mx-auto flex gap-2 items-center"
        >
          <input
            name="message"
            className="flex-1 pl-4 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Type your message…"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  )
}
