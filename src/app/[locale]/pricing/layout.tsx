import type { Metadata } from 'next'
import { canonicalUrl, DEFAULT_SITE_DESCRIPTION } from '@/shared/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Тарифы и подписка',
    description:
      'Тарифы Daisy: доступ к AI-поддержке ментального здоровья на основе научных подходов. Выбери план и начни заботиться о себе.',
    alternates: {
      canonical: canonicalUrl(locale, '/pricing'),
    },
    openGraph: {
      title: 'Тарифы и подписка | Daisy',
      description: DEFAULT_SITE_DESCRIPTION,
      url: canonicalUrl(locale, '/pricing'),
    },
  }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
