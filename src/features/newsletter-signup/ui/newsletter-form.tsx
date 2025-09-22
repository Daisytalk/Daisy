'use client'

import { useState } from 'react'
import { Button, Input } from '@/shared/ui'
import { Mail } from 'lucide-react'

interface NewsletterFormProps {
  onSubmit?: (email: string) => Promise<void>
  className?: string
}

export function NewsletterForm({ onSubmit, className }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setIsLoading(true)
    try {
      await onSubmit?.(email)
      setIsSuccess(true)
      setEmail('')
    } catch (error) {
      console.error('Newsletter signup failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`text-center ${className}`}>
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
          <Mail className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Thanks for subscribing!
        </h3>
        <p className="text-gray-600">
          We'll keep you updated with our latest news and features.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
    </form>
  )
}