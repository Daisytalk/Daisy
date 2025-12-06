'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function ChatDemoSection() {
  const t = useTranslations('chatDemo')
  
  const messages = [
    { from: 'user', text: t('message1User') },
    { from: 'bot', text: t('message2Bot') },
    { from: 'user', text: t('message3User') },
    { from: 'bot', text: t('message4Bot') },
    { from: 'user', text: t('message5User') },
    { from: 'bot', text: t('message6Bot') },
  ]

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
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
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
            {t('getHelp')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}