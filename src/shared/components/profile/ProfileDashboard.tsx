'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { ProfileStatusCard } from './ProfileStatusCard'
import { TrendSummaryCard } from './TrendSummaryCard'
import { DetailedDynamics } from './DetailedDynamics'
import { DynamicsCard } from '@/app/[locale]/dashboard/DynamicsCard'
import { MessageCircle } from 'lucide-react'
import { RecommendedPrograms } from './RecommendedPrograms'
import { NextWeekRecommendations } from './NextWeekRecommendations'
import { ProfilePremiumBanner } from './ProfilePremiumBanner'
import { DailyCheckInModal } from './DailyCheckInModal'
import { AppLayout } from '@/shared/components/AppLayout'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { filterHistoryByRollingDays } from '@/shared/lib/dynamics-date-window'

type Tab = 'overview' | 'detailed'

interface User {
  id: string
  name: string | null
  subscriptionStatus: string
}

interface Snapshot {
  id: string
  ESI: number
  BSI: number
  SSI: number
  PVI: number
  MRI: number
  riskLevel: string
  cluster: string | null
  flags: unknown
  createdAt: Date
}

interface HistoryRecord {
  id: string
  date: Date
  emotion: number | null
  stress: number | null
  energy: number | null
  support: number | null
}

interface ProfileDashboardProps {
  user: User | null
  snapshot: Snapshot | null
  preferences: unknown
  history: HistoryRecord[]
  memoryTopics: string[]
  locale: string
  hasCheckInToday?: boolean
}

export function ProfileDashboard({
  user,
  snapshot,
  history,
  memoryTopics,
  locale,
  hasCheckInToday,
}: ProfileDashboardProps) {
  const t = useTranslations('nav')
  const tp = useTranslations('profile')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  const isPremium = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trial'
  const history7d = useMemo(() => filterHistoryByRollingDays(history, 7), [history])
  const history30d = history

  const dynamicsRatingsForCard = useMemo(
    () =>
      history7d.map((h) => ({
        id: h.id,
        date: h.date,
        emotion: h.emotion,
        stress: h.stress,
        energy: h.energy,
        support: h.support,
      })),
    [history7d]
  )

  useEffect(() => {
    if (!isPremium) return
    fetch('/api/account/weekly-report?period=7d', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.recommendations?.length) setAiRecommendations(d.recommendations)
      })
      .catch(() => {})
  }, [isPremium])

  const firstName = user?.name?.split(' ')[0] || ''

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-[#faf8f5] via-[#f5f5f5] to-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
                {firstName ? tp('dashboard.greetingNamed', { name: firstName }) : tp('dashboard.greeting')}
              </h1>
              <p className="text-[15px] text-[#6b6b6b] mt-1">{tp('dashboard.subtitle')}</p>
            </div>
            <Link
              href={`/${locale}/settings`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white border border-[#e8e8e8] text-[#5ba3c6] hover:text-[#4a8fb3] text-sm font-medium shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" />
              {t('settings')}
            </Link>
          </div>

          {user?.name && (
            <DailyCheckInModal userName={user.name} hasCheckInToday={hasCheckInToday} />
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
            <TabsList className="w-full grid grid-cols-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl h-14 border border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <TabsTrigger
                value="overview"
                className="rounded-xl data-[state=active]:bg-[#e0f7fa] data-[state=active]:text-[#2d2d2d] data-[state=active]:shadow-sm text-[15px] font-medium transition-all"
              >
                {tp('tabs.overview')}
              </TabsTrigger>
              <TabsTrigger
                value="detailed"
                className="rounded-xl data-[state=active]:bg-[#e0f7fa] data-[state=active]:text-[#2d2d2d] data-[state=active]:shadow-sm text-[15px] font-medium transition-all"
              >
                {tp('tabs.detailed')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-8 space-y-6">
            <ProfileStatusCard snapshot={snapshot} locale={locale} />
            <DynamicsCard variant="light" ratingsFromServer={dynamicsRatingsForCard} />
            <TrendSummaryCard
              history={history}
              onDetailsClick={() => setActiveTab('detailed')}
              locale={locale}
            />
            <RecommendedPrograms snapshot={snapshot} isPremium={isPremium} locale={locale} />
            <NextWeekRecommendations
              snapshot={snapshot}
              history={history}
              isPremium={isPremium}
              aiRecommendations={aiRecommendations}
            />
            <section>
              <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
                {tp('quickActions')}
              </h2>
              <Link
                href={`/${locale}/chat`}
                className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#e0f7fa] to-[#d4f1f5] hover:from-[#b2ebf2] hover:to-[#a5e6ed] border border-[#b2ebf2]/50 p-5 transition-all shadow-[0_2px_8px_rgba(91,163,198,0.12)] hover:shadow-[0_4px_16px_rgba(91,163,198,0.18)] group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6 text-[#5ba3c6]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#2d2d2d] text-[15px]">{tp('talkToDaisyShort')}</p>
                  <p className="text-[13px] text-[#6b6b6b] mt-0.5">{tp('quickActionChatDesc')}</p>
                </div>
              </Link>
            </section>
            {!isPremium && <ProfilePremiumBanner locale={locale} />}
          </TabsContent>

          <TabsContent value="detailed" className="mt-8">
            <DetailedDynamics history={history30d} locale={locale} />
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </AppLayout>
  )
}
