import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { canonicalUrl, DEFAULT_SITE_DESCRIPTION } from '@/shared/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pricing' })
  const title = locale === 'en' ? 'Pricing & Subscriptions' : 'Тарифы и подписка'

  return {
    title,
    description: t('subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, '/pricing'),
    },
    openGraph: {
      title: `${title} | Daisy`,
      description: t('subtitle') || DEFAULT_SITE_DESCRIPTION,
      url: canonicalUrl(locale, '/pricing'),
    },
    robots: { index: true, follow: true },
  }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
