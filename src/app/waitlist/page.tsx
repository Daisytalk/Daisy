"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, MessageSquare, Send } from 'lucide-react'
import { ClientOnly } from '@/shared/components/ClientOnly'

function WaitlistPageContent() {
    const [formData, setFormData] = useState({
        name: '',
        preferredName: '',
        email: '',
        telegram: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (error) setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 409) {
                    throw new Error('This email is already on our waitlist. Thank you for your interest!')
                } else if (response.status === 400) {
                    throw new Error(data.error || 'Please check your information and try again.')
                } else {
                    throw new Error(data.error || 'Unable to submit your application right now. Please try again in a moment.')
                }
            }

            setIsSubmitted(true)
        } catch (error) {
            console.error('Form submission error:', error)
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('There was an unexpected error. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
                >
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-rose-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank you!</h1>
                        <p className="text-gray-600 text-lg">keep an eye on your inbox. Daisy will reach you out right about the time! ❤️</p>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        oops! seems Daisy is needed extra today.
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        please send us your application below and as your queue comes – you will be the one to try out our Daisy
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6"
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-sm flex-1">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                                aria-label="Dismiss error"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                placeholder="Your full name"
                                required
                            />
                        </div>
                    </div>

                    {/* Preferred Name */}
                    <div>
                        <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="preferredName"
                                name="preferredName"
                                type="text"
                                value={formData.preferredName}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                placeholder="What should we call you?"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            E-mail
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Telegram */}
                    <div>
                        <label htmlFor="telegram" className="block text-sm font-medium text-gray-700 mb-2">
                            Telegram nickname
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="telegram"
                                name="telegram"
                                type="text"
                                value={formData.telegram}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                placeholder="@yourusername"
                                required
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            How do you think Daisy could help you?
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-none"
                            placeholder="Tell us about your needs and how Daisy might assist you..."
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-rose-500 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                    >
                        {isSubmitting ? 'Sending...' : 'send ❤️'}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-8 text-center text-xs sm:text-sm text-gray-500 italic">
                    please check your inbox... Daisy will reach you out right about the time!
                </p>
            </motion.div>
        </div>
    )
}

export default function WaitlistPage() {
    return (
        <ClientOnly>
            <WaitlistPageContent />
        </ClientOnly>
    )
}