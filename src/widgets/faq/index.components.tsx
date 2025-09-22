'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "How does Daisy work?",
    answer: "Daisy is an innovative chatbot designed to provide psychological support. It uses advanced artificial intelligence technology to conduct therapeutic conversations, helping users cope with stress, anxiety, and other emotional issues."
  },
  {
    question: "Can the bot replace a real therapist?",
    answer: "No, our bot does not replace a professional therapist. It is created as a supplementary support tool and can help when you need someone to talk to or get basic recommendations. For serious psychological issues, we always recommend consulting a qualified specialist."
  },
  {
    question: "Can Daisy diagnose mental disorders?",
    answer: "No, Daisy cannot diagnose mental disorders. She provides recommendations, support, and general advice based on your responses, but does not replace professional medical or psychological help. For diagnosis and treatment, we recommend consulting a qualified psychologist or psychiatrist."
  },
  {
    question: "How does Daisy personalize recommendations?",
    answer: "Daisy uses artificial intelligence to analyze your responses and track emotional patterns. She remembers key details, takes into account your goals and experience, offering personalized advice and support. The more you interact with Daisy, the more accurate and helpful her recommendations become, adapted to your individual needs."
  },
  {
    question: "How confidential are my conversations with the bot?",
    answer: "We ensure complete confidentiality of all conversations. All data is encrypted, and personal information is not shared with third parties. You can be confident that your conversations with the bot will remain private."
  },
  {
    question: "When is the bot available?",
    answer: "The bot is available 24/7, allowing you to get support at any time of day or night. This is especially important when traditional psychological help is unavailable, such as late at night or on weekends."
  },
  {
    question: "How do I start using the bot?",
    answer: "Starting to use the bot is very simple: Purchase a subscription, follow the link to Daisy's Telegram chat, and start a dialogue right away."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-8xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold leading-10 tracking-tight text-gray-900">FAQ</h2>
        </motion.div>

        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border-b border-gray-200"
            >
              <button
                className="flex w-full items-center justify-between text-left text-gray-900 py-6 hover:text-gray-700 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-xl font-medium leading-7 pr-8">{faq.question}</span>
                <span className="ml-6 flex h-7 items-center">
                  {openIndex === index ? (
                    <Minus className="h-6 w-6 transform transition-transform duration-300" aria-hidden="true" />
                  ) : (
                    <Plus className="h-6 w-6 transform transition-transform duration-300" aria-hidden="true" />
                  )}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pr-12">
                      <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}