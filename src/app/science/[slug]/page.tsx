import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getResearchPaperBySlug, getAllResearchPapers } from '@/shared/data/research-papers'

export async function generateStaticParams() {
  const papers = getAllResearchPapers()
  return papers.map((paper) => ({
    slug: paper.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const paper = getResearchPaperBySlug(params.slug)

  if (!paper) {
    return {
      title: 'Research Not Found',
    }
  }

  return {
    title: `${paper.title} | Daisy Research`,
    description: paper.abstract.substring(0, 160),
  }
}

export default function ResearchPaperPage({ params }: { params: { slug: string } }) {
  const paper = getResearchPaperBySlug(params.slug)

  if (!paper) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#D1E2D3]/30 to-white">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
          <Link
            href="/#science"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <time>{paper.date}</time>
              <span>•</span>
              <span>{paper.readTime}</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {paper.title}
            </h1>

            <p className="text-lg text-gray-600">
              {paper.authors} ({paper.year})
            </p>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="mx-auto max-w-4xl px-6 lg:px-8 -mt-8">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <img
            src={paper.imageUrl}
            alt={paper.title}
            className="w-full h-[400px] object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Abstract</h2>

          <div className="text-gray-700 leading-relaxed space-y-4">
            {paper.abstract.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Original Publication Link */}
          <div className="mt-12 p-6 bg-[#D1E2D3]/20 rounded-xl border border-[#D1E2D3]">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Read Full Publication</h3>
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="break-all">{paper.link}</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>

          {/* Citation */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Citation</h3>
            <p className="text-sm text-gray-700 font-mono">
              {paper.authors} ({paper.year}). {paper.title}.
            </p>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-[#D1E2D3]/30 to-[#FFDC61]/20 rounded-2xl">
            <h3 className="text-2xl font-semibold text-gray-900">
              Experience AI-Powered Mental Health Support
            </h3>
            <p className="text-gray-600 max-w-xl">
              Daisy combines evidence-based therapeutic approaches with cutting-edge AI to provide accessible, personalized mental health support.
            </p>
            <Link
              href="/register"
              className="rounded-full bg-[#FFDC61] px-8 py-3 text-lg font-semibold text-black shadow-sm hover:bg-[#FFDC61]/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
