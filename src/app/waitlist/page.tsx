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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to submit form')
            }

            setIsSubmitted(true)
        } catch (error) {
            console.error('Form submission error:', error)
            alert('There was an error submitting your application. Please try again.')
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