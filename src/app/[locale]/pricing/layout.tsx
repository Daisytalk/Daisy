import type { Metadata } from 'next'
import { canonicalUrl, DEFAULT_SITE_DESCRIPTION } from '@/shared/lib/seo'

export const metadata: Metadata = {
  title: 'Тарифы и подписка',
  description:
    'Тарифы Daisy: доступ к AI-поддержке ментального здоровья на основе научных подходов. Выбери план и начни заботиться о себе.',
  alternates: {
    canonical: canonicalUrl('ru', '/pricing'),
  },
  openGraph: {
    title: 'Тарифы и подписка | Daisy',
    description: DEFAULT_SITE_DESCRIPTION,
    url: canonicalUrl('ru', '/pricing'),
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
