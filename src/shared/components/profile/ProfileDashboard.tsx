'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { ProfileStatusCard } from './ProfileStatusCard'
import { TrendSummaryCard } from './TrendSummaryCard'
import { DetailedDynamics } from './DetailedDynamics'
import { RecommendedPrograms } from './RecommendedPrograms'
import { NextWeekRecommendations } from './NextWeekRecommendations'
import { WeeklyReportCard } from './WeeklyReportCard'
import { ProfilePremiumBanner } from './ProfilePremiumBanner'
import { DailyCheckInModal } from './DailyCheckInModal'
import { AppLayout } from '@/shared/components/AppLayout'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Tab = 'overview' | 'detailed' | 'weekly'

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
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const isPremium = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trial'
  const history7d = history.slice(-7)
  const history30d = history

  return (
    <AppLayout>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 min-h-screen">
        <div className="flex justify-end">
          <Link
            href={`/${locale}/settings`}
            className="flex items-center gap-2 text-sm text-[#5ba3c6] hover:text-[#4a8fb3]"
          >
            <Settings className="w-4 h-4" />
            {t('settings')}
          </Link>
        </div>
        {user?.name && (
          <DailyCheckInModal userName={user.name} hasCheckInToday={hasCheckInToday} />
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="w-full grid grid-cols-3 bg-[#f0f0f0] p-1 rounded-[16px] h-12">
            <TabsTrigger value="overview" className="rounded-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm text-[15px]">Обзор</TabsTrigger>
            <TabsTrigger value="detailed" className="rounded-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm text-[15px]">Детально</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm text-[15px]">Отчёт {isPremium ? '' : '🔒'}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8 space-y-8">
            <ProfileStatusCard snapshot={snapshot} locale={locale} />
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
            />
            {!isPremium && <ProfilePremiumBanner locale={locale} />}
          </TabsContent>

          <TabsContent value="detailed" className="mt-8">
            <DetailedDynamics history={history30d} locale={locale} />
          </TabsContent>

          <TabsContent value="weekly" className="mt-8">
            <WeeklyReportCard
              history={history30d}
              memoryTopics={memoryTopics}
              isPremium={isPremium}
              locale={locale}
            />
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  )
}
