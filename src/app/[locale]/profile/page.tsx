'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User as UserIcon, Mail, Calendar, Shield, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import type { OnboardingData, OnboardingQuestion } from '@/shared/types/auth'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'

function ProfilePageContent() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const onboardingService = new OnboardingApiService()

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      const [data, sections] = await Promise.all([
        onboardingService.getOnboardingData(user.id),
        onboardingService.getQuestions()
      ])
      setOnboardingData(data)
      setQuestions(sections.flatMap(section => section.questions))
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestionText = (questionId: string) =>
    questions.find(q => q.id === questionId)?.question || questionId

  const formatAnswer = (answer: unknown): string => {
    if (typeof answer === 'object' && answer !== null) {
      const o = answer as Record<string, unknown>
      if (o.rating !== undefined) {
        return `Rating: ${o.rating}/5${o.comment ? ` — ${o.comment}` : ''}`
      }
      return JSON.stringify(answer)
    }
    if (Array.isArray(answer)) return answer.join(', ')
    if (typeof answer === 'boolean') return answer ? 'Yes' : 'No'
    return String(answer)
  }

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 14

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center bg-[hsl(var(--app-bg))]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-[hsl(var(--app-bg))]">
        <div className="shrink-0 h-32 sm:h-36 bg-gradient-to-br from-primary to-primary/80" />
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end gap-4 pb-6"
          >
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-[hsl(var(--app-bg))] shadow-lg flex items-center justify-center text-3xl font-semibold text-primary shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary">
                  {user?.subscriptionStatus === 'trial' ? `Trial · ${trialDaysLeft} days left` : 'Premium'}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-medium bg-muted text-muted-foreground">
                  {onboardingData?.completedAt ? 'Onboarding complete' : 'Setup pending'}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8 pb-12">
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Account</h2>
              <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white overflow-hidden divide-y divide-[hsl(var(--app-border))]">
                <div className="flex items-center gap-4 p-4">
                  <UserIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full name</p>
                    <p className="font-medium text-foreground">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4">
                  <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4">
                  <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Subscription</p>
                    <p className="font-medium text-foreground">{user?.subscriptionStatus === 'trial' ? 'Free Trial' : 'Premium'}</p>
                  </div>
                </div>
                {user?.subscriptionStatus === 'trial' && (
                  <div className="flex items-center gap-4 p-4">
                    <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Trial</p>
                      <p className="font-medium text-foreground">{trialDaysLeft > 0 ? `${trialDaysLeft} days remaining` : 'Expired'}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {onboardingData?.answers && onboardingData.answers.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Onboarding responses</h2>
                <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white overflow-hidden divide-y divide-[hsl(var(--app-border))]">
                  {onboardingData.answers.map((answer, index) => (
                    <div key={index} className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{getQuestionText(answer.questionId)}</p>
                      <p className="text-foreground">{formatAnswer(answer.answer)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  These answers help Daisy personalize support for you.
                </p>
              </section>
            )}

            <section className="rounded-2xl bg-primary p-6 text-primary-foreground">
              <h2 className="font-semibold text-lg mb-2">Your personalized AI therapist</h2>
              <p className="text-white/90 text-sm mb-4">
                Daisy uses your onboarding responses to tailor conversations. Start a chat when you’re ready.
              </p>
              <button
                onClick={() => router.push(`/${locale}/chat`)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-white text-primary font-medium hover:bg-white/95 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Open chat
              </button>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <ProfilePageContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
