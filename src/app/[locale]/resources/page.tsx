import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { canonicalUrl } from '@/shared/lib/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

type ComplianceItem = { icon: string; title: string; desc: string }
type RegionalLaw = { flag: string; text: string }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'resourcesPage' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: canonicalUrl(locale, '/resources'),
    },
    openGraph: {
      title: t('meta.ogTitle'),
      url: canonicalUrl(locale, '/resources'),
    },
  }
}

export default async function ResourcesPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'resourcesPage' })

  const complianceItems = t.raw('complianceItems') as ComplianceItem[]
  const regionalLaws = t.raw('regionalLaws') as RegionalLaw[]
  const standards = t.raw('standards') as string[]

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('heroTitle')}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t('heroSubtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('sectionPrivacy')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {complianceItems.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-[hsl(var(--app-border))] shadow-[var(--app-shadow)]"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('sectionRegional')}</h2>
          <ul className="space-y-3">
            {regionalLaws.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 items-start p-4 rounded-2xl bg-white border border-[hsl(var(--app-border))] text-foreground text-sm"
              >
                <span className="shrink-0">{item.flag}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('sectionStandards')}</h2>
          <div className="flex flex-wrap gap-3">
            {standards.map((s, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-2xl bg-primary/15 text-foreground text-sm font-medium border border-primary/20"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
