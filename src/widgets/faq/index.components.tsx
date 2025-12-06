'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function FAQSection() {
  const t = useTranslations('faq')
  
  const faqs = [
    {
      question: t('question1'),
      answer: t('answer1')
    },
    {
      question: t('question2'),
      answer: t('answer2')
    },
    {
      question: t('question3'),
      answer: t('answer3')
    },
    {
      question: t('question4'),
      answer: t('answer4')
    },
    {
      question: t('question5'),
      answer: t('answer5')
    },
    {
      question: t('question6'),
      answer: t('answer6')
    },
    {
      question: t('question7'),
      answer: t('answer7')
    }
  ]
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
          <h2 className="text-4xl font-bold leading-10 tracking-tight text-gray-900">{t('title')}</h2>
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