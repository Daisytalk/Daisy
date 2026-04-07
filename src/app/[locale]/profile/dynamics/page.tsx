import { getRollingWindowStartUtc } from '@/shared/lib/dynamics-date-window'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import prisma from '@/shared/lib/database'
import { getCurrentUserId } from '@/shared/lib/server-auth'
import { AppLayout } from '@/shared/components/AppLayout'
import { DetailedDynamics } from '@/shared/components/profile/DetailedDynamics'
import { getTranslations } from 'next-intl/server'
import { canonicalUrl } from '@/shared/lib/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'profile' })
  return {
    title: t('dynamicsPage.metaTitle'),
    description: t('dynamicsPage.metaDescription'),
    alternates: {
      canonical: canonicalUrl(locale, '/profile/dynamics'),
    },
  }
}

export default async function ProfileDynamicsPage({ params }: PageProps) {
  const { locale } = await params
  const userId = await getCurrentUserId()
  if (!userId) redirect(`/${locale}/login`)

  const t = await getTranslations({ locale, namespace: 'profile' })

  const history30d = await prisma.stressRating.findMany({
    where: {
      userId,
      source: 'daily_checkin',
      date: { gte: getRollingWindowStartUtc(30) },
    },
    orderBy: { date: 'asc' },
  })

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-[#faf8f5] via-[#f5f5f5] to-[#fafafa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
          <Link
            href={`/${locale}/profile`}
            className="inline-flex items-center gap-2 text-[#6b6b6b] hover:text-[#2d2d2d] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {t('dynamicsPage.backToProfile')}
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
              {t('tabs.detailed')}
            </h1>
            <p className="text-[15px] text-[#6b6b6b] mt-1">{t('dynamicsPage.subtitle')}</p>
          </div>
          <DetailedDynamics
            history={history30d.map((r) => ({
              id: r.id,
              date: r.date,
              emotion: r.emotion,
              stress: r.stress,
              energy: r.energy,
              support: r.support,
            }))}
            locale={locale}
          />
        </div>
      </main>
    </AppLayout>
  )
}
