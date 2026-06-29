import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PrivacyToc } from './PrivacyToc'
import { canonicalUrl } from '@/shared/lib/seo'
import { getPrivacyArticleHtml } from '@/shared/lib/privacy-article'

export const dynamic = 'force-static'

const articleProseClass =
  'prose prose-slate max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-1.5 prose-p:text-foreground/90 prose-li:text-foreground/90'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: canonicalUrl(locale, '/privacy'),
    },
    robots: { index: true, follow: true },
  }
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  const articleHtml = await getPrivacyArticleHtml(locale)

  return (
    <div className="min-h-screen bg-[hsl(var(--app-bg))]">
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-sky-100 border-b border-sky-200/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-blue-100/50 blur-2xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sky-800/80 hover:text-sky-900 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('hero.backToHome')}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm border border-sky-200/60 flex items-center justify-center shadow-sm">
              <Shield className="w-7 h-7 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-900 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="mt-4 text-sky-800/80 text-sm flex flex-wrap gap-x-6 gap-y-1">
                <span>{t('hero.effectiveDate')}</span>
                <span className="text-sky-300">·</span>
                <span>{t('hero.lastUpdated')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex gap-12 xl:gap-16">
          <PrivacyToc />

          <div className="min-w-0 flex-1">
            <div className="rounded-2xl bg-card border border-border shadow-sm p-8 sm:p-10 lg:p-12">
              <article className={articleProseClass}>
                <p className="text-muted-foreground text-sm mb-8 flex flex-wrap gap-x-6 gap-y-1">
                  <span>{t('hero.effectiveDate')}</span>
                  <span className="text-border">·</span>
                  <span>{t('hero.lastUpdated')}</span>
                </p>
                <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
              </article>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('hero.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
