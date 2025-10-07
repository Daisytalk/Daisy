'use client'

import { motion } from 'framer-motion'

const messages = [
  { from: 'user', text: "Hi! Lately I've been feeling down. I can't focus on work and constantly feel anxious..." },
  { from: 'bot', text: "Hello! I understand how difficult it can be to deal with anxiety. Let's figure this out together. How long have you noticed these symptoms? Have you tried any relaxation techniques before?" },
  { from: 'user', text: "It started about a month ago. I tried breathing exercises, but I'm not sure if I'm doing them correctly. Can you suggest something simple to start with?" },
  { from: 'bot', text: "Of course! Let's start with a simple meditation. I suggest trying the '5-5-5' technique: inhale for 5 seconds, hold for 5 seconds, exhale for 5 seconds. Practice this exercise for 5 minutes. Would you like to try it now?" },
  { from: 'user', text: "Yes, let's try! Honestly, I already feel better just being able to discuss this with someone." },
  { from: 'bot', text: "That's wonderful! Remember that you're not alone on this journey. Let's start the meditation, and afterward, I'll teach you some more useful techniques that will help you deal with stress in everyday life." },
]

export function ChatDemoSection() {
  return (
    <div className="bg-white pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See How Daisy Supports You
          </h2>
          <p className="text-lg text-gray-600">
            Experience a real conversation with our AI-powered mental health assistant
          </p>
        </motion.div>

        <div className="space-y-6">
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex items-start gap-4 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.from === 'bot' && (
                <div className="h-10 w-10 rounded-full bg-[#7E9EC4] flex items-center justify-center font-bold text-white flex-shrink-0">
                  D
                </div>
              )}
              <div className={`max-w-md rounded-2xl p-4 text-left text-base ${
                msg.from === 'user' 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-[#7E9EC4]/10 text-gray-900 border border-[#7E9EC4]/20'
              }`}>
                <p>{msg.text}</p>
              </div>
              {msg.from === 'user' && (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                  U
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="rounded-full bg-[#7E9EC4] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7E9EC4]">
            Get Help
          </button>
        </motion.div>
      </div>
    </div>
  )
}