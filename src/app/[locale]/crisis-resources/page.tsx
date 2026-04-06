import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { canonicalUrl } from '@/shared/lib/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'crisisResources' })
  const path = '/crisis-resources'
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, path),
    },
    openGraph: {
      title: `${t('title')} | Daisy`,
      url: canonicalUrl(locale, path),
    },
  }
}

export default async function CrisisResourcesPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations('crisisResources')

  return (
    <div className="min-h-screen bg-[hsl(var(--app-bg))]">
      <div className="border-b border-[hsl(var(--app-border))] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToHome')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-red-50 border border-red-100 p-6 mb-8">
          <p className="text-red-800 font-medium">
            {t('disclaimer')}
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">{t('globalTitle')}</h2>
          <ul className="space-y-4">
            <li className="flex gap-4 p-4 rounded-2xl bg-white border border-[hsl(var(--app-border))]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('textLineTitle')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('textLineDesc')}</p>
                <p className="mt-2 text-primary font-medium">{t('textLineHint')}</p>
              </div>
            </li>
            <li className="flex gap-4 p-4 rounded-2xl bg-white border border-[hsl(var(--app-border))]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('emergencyTitle')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('emergencyDesc')}</p>
                <p className="mt-2 text-primary font-medium">{t('emergencyNumbers')}</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t('moreTitle')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('moreDesc')}
          </p>
        </section>

      </div>
    </div>
  )
}
