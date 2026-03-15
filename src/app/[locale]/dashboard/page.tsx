import { DashboardContent } from './DashboardContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Navigation' })
  return {
    title: `${t('dashboard')} - Daisy`,
  }
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-daisy-950">
      <DashboardContent />
    </div>
  )
}
