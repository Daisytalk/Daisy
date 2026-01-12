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
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{paper.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{paper.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {paper.title}
          </h1>

          <p className="text-lg text-gray-600">
            {paper.authors} ({paper.year})
          </p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <img
            src={paper.imageUrl}
            alt={paper.title}
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract</h2>
          
          <div className="text-gray-700 text-lg leading-relaxed space-y-4">
            {paper.abstract.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-xl font-bold mb-3">
            Read the Full Research Paper
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Access the complete study and detailed findings from the original publication.
          </p>
          <a
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFDC61] text-black font-semibold rounded-lg hover:bg-[#FFDC61]/90 transition-colors"
          >
            <span>View Full Paper</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="bg-[#FFDC61]/10 rounded-2xl border border-[#FFDC61]/30 p-8">
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
      </article>

      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience AI-Powered Mental Health Support?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands who have found support with Daisy's evidence-based therapeutic conversations.
          </p>
          <Link
            href={`/${locale}/onboarding`}
            className="inline-block px-8 py-4 bg-[#FFDC61] text-black font-semibold rounded-lg hover:bg-[#FFDC61]/90 transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  )
}
