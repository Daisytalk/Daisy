import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Clock } from 'lucide-react'
import { getResearchPaperBySlug } from '@/shared/data/research-papers'

interface PageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export default async function ScienceArticlePage({ params }: PageProps) {
  const { slug, locale } = await params
  const paper = getResearchPaperBySlug(slug)

  if (!paper) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[60vh] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={paper.imageUrl}
            alt={paper.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/70 to-gray-900/90" />
        </div>

        {/* Content */}
        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-24">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{paper.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{paper.readTime}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              {paper.title}
            </h1>

            <p className="text-lg text-white/90">
              {paper.authors} ({paper.year})
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract</h2>
            
            <div className="text-gray-700 text-lg leading-relaxed space-y-6">
              {paper.abstract.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* External Link Card */}
          <div className="mt-12 p-8 bg-gradient-to-br from-[#D1E2D3]/30 to-[#7E9EC4]/30 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Read the Full Research Paper
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Access the complete study and detailed findings from the original publication.
            </p>
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            >
              <span>View Full Paper</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          {/* About Daisy Card */}
          <div className="mt-12 p-8 bg-[#FFDC61]/10 rounded-2xl border border-[#FFDC61]/30">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              About Daisy
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Daisy is an AI-powered mental health assistant that provides evidence-based therapeutic support. 
              Our approach is grounded in the latest research in artificial intelligence and psychotherapy, 
              ensuring that users receive effective, accessible, and personalized mental health care.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-gray-700 transition-colors"
            >
              <span>Learn more about Daisy</span>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </article>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Experience AI-Powered Mental Health Support?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands who have found support with Daisy's evidence-based therapeutic conversations.
          </p>
          <Link
            href={`/${locale}/onboarding`}
            className="inline-block px-8 py-4 bg-[#FFDC61] text-black font-semibold rounded-full hover:bg-[#FFDC61]/90 transition-colors shadow-xl"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  )
}
