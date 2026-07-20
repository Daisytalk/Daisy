import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { PricingPageClient } from './PricingPageClient'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pricing' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tFooter = await getTranslations({ locale, namespace: 'footer' })

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {tNav('home')}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-foreground transition-colors">
              {tFooter('privacyPolicy')}
            </Link>
            <Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-foreground transition-colors">
              {tFooter('termsOfService')}
            </Link>
            <Link href={`/${locale}/refund`} className="text-muted-foreground hover:text-foreground transition-colors">
              {tFooter('refundPolicy')}
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2d3748] tracking-tight">
            {t('title')}
          </h1>
          <p className="text-[15px] text-[#718096] mt-2 max-w-lg mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <PricingPageClient />
      </main>
    </div>
  )
}
