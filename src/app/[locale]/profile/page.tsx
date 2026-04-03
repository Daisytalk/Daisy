import { startOfDay, subDays } from 'date-fns'
import { redirect } from 'next/navigation'
import prisma from '@/shared/lib/database'
import { getCurrentUserId } from '@/shared/lib/server-auth'
import { ProfileDashboard } from '@/shared/components/profile/ProfileDashboard'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params
  const userId = await getCurrentUserId()
  if (!userId) redirect(`/${locale}/login`)

  const [user, snapshot, preferences, history30d, memoryTopics, todayCheckIn] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, subscriptionStatus: true },
    }),
    prisma.psychProfileSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userPreferences.findUnique({ where: { userId } }),
    prisma.stressRating.findMany({
      where: {
        userId,
        source: 'daily_checkin',
        date: { gte: startOfDay(subDays(new Date(), 30)) },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.memoryItem.findMany({
      where: {
        userId,
        createdAt: { gte: subDays(new Date(), 7) },
      },
      select: { topic: true },
    }),
    prisma.stressRating.findFirst({
      where: {
        userId,
        source: 'daily_checkin',
        date: { gte: startOfDay(new Date()) },
      },
    }),
  ])

  return (
    <ProfileDashboard
      user={user}
      snapshot={snapshot}
      preferences={preferences}
      history={history30d.map((r) => ({
        id: r.id,
        date: r.date,
        emotion: r.emotion,
        stress: r.stress,
        energy: r.energy,
        support: r.support,
      }))}
      memoryTopics={memoryTopics.map((m) => m.topic)}
      locale={locale}
      hasCheckInToday={!!todayCheckIn}
    />
  )
}
