import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { getResearchPaperBySlug } from '@/shared/data/research-papers'
import { localizeDate, localizeReadTime } from '@/shared/lib/research-i18n'
import Image from 'next/image'
import { canonicalUrl, getSiteUrl } from '@/shared/lib/seo'

const articleText = {
  ru: {
    backToHome: 'На главную',
    abstract: 'Аннотация',
    viewFullPaper: 'Все публикации',
    viewFullPaperDesc: 'Доступ к полному исследованию и детальным результатам из оригинальной публикации.',
    aboutDaisy: 'О Daisy',
    aboutDaisyDesc: 'Daisy - AI-ассистент для ментального благополучия, предоставляющий поддержку на основе научных данных. Наш подход основан на последних исследованиях в области ИИ и психотерапии.',
    learnMore: 'Узнать больше о Daisy',
    ctaTitle: 'Готовы попробовать поддержку на основе ИИ?',
    ctaDesc: 'Присоединяйтесь к тысячам тех, кто нашёл поддержку с Daisy.',
    getStarted: 'Начать сегодня',
  },
  en: {
    backToHome: 'Back to Home',
    abstract: 'Abstract',
    viewFullPaper: 'View Full Paper',
    viewFullPaperDesc: 'Access the complete study and detailed findings from the original publication.',
    aboutDaisy: 'About Daisy',
    aboutDaisyDesc: 'Daisy is an AI-powered mental health assistant providing evidence-based support. Our approach is grounded in the latest research in AI and psychotherapy.',
    learnMore: 'Learn more about Daisy',
    ctaTitle: 'Ready to Experience AI-Powered Mental Health Support?',
    ctaDesc: "Join thousands who have found support with Daisy's evidence-based conversations.",
    getStarted: 'Get Started Today',
  },
}

interface PageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const paper = getResearchPaperBySlug(slug)
  if (!paper) {
    return { title: 'Публикация' }
  }
  const title = locale === 'ru' ? paper.titleRu : paper.title
  const desc =
    locale === 'ru'
      ? paper.abstractRu.slice(0, 155).replace(/\s+\S*$/, '') + '…'
      : paper.abstract.slice(0, 155).replace(/\s+\S*$/, '') + '…'
  const url = canonicalUrl(locale, `/science/${slug}`)
  const ogImage =
    paper.imageUrl.startsWith('http') ? paper.imageUrl : `${getSiteUrl()}${paper.imageUrl}`
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      type: 'article',
      publishedTime: paper.date,
      images: [{ url: ogImage, width: 768, height: 432, alt: title }],
    },
  }
}

export default async function ScienceArticlePage({ params }: PageProps) {
  const { slug, locale } = await params
  const paper = getResearchPaperBySlug(slug)
  const t = articleText[locale as keyof typeof articleText] || articleText.en

  if (!paper) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{localizeDate(paper.date, locale)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{localizeReadTime(paper.readTime, locale)}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {locale === 'ru' ? paper.titleRu : paper.title}
          </h1>

          <p className="text-lg text-gray-600">
            {paper.authors} ({paper.year})
          </p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-200 overflow-hidden mb-8 h-72">
          <Image
            src={paper.imageUrl}
            alt={paper.title}
            width={768}
            height={432}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.abstract}</h2>
          <div className="text-gray-700 text-lg leading-relaxed space-y-4">
            {(locale === 'ru' ? paper.abstractRu : paper.abstract).split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-xl font-bold mb-3">
            {t.viewFullPaper}
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {t.viewFullPaperDesc}
          </p>
          <a
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFDC61] text-black font-semibold rounded-lg hover:bg-[#FFDC61]/90 transition-colors"
          >
            <span>{t.viewFullPaper}</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="bg-[#FFDC61]/10 rounded-2xl border border-[#FFDC61]/30 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {t.aboutDaisy}
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {t.aboutDaisyDesc}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-gray-700 transition-colors"
          >
            <span>{t.learnMore}</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </article>

      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {t.ctaDesc}
          </p>
          <Link
            href={`/${locale}/onboarding`}
            className="inline-block px-8 py-4 bg-[#FFDC61] text-black font-semibold rounded-lg hover:bg-[#FFDC61]/90 transition-colors"
          >
            {t.getStarted}
          </Link>
        </div>
      </div>
    </div>
  )
}
