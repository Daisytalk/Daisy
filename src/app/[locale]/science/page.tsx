import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAllResearchPapers } from '@/shared/data/research-papers'

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function SciencePage({ params }: PageProps) {
  const { locale } = await params
  const papers = getAllResearchPapers()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            The Science Behind Daisy
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore the latest scientific research on artificial intelligence and digital solutions 
            in supporting mental health care.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/${locale}/science/${paper.slug}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-900 hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={paper.imageUrl}
                  alt={paper.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="text-xs text-gray-500 mb-3 font-medium">
                  <time>{paper.date}</time>
                  <span className="mx-2">•</span>
                  <span>{paper.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                  {paper.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {paper.authors} ({paper.year})
                </p>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {paper.abstract.split('\n\n')[0]}
                </p>
                <div className="mt-4 inline-flex items-center text-gray-900 text-sm font-semibold group-hover:gap-2 transition-all">
                  <span>Read more</span>
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Experience Evidence-Based Mental Health Support
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Daisy combines the latest AI research with proven therapeutic techniques to provide 
            accessible, personalized mental health care.
          </p>
          <Link
            href={`/${locale}/onboarding`}
            className="inline-block px-8 py-4 bg-[#FFDC61] text-black font-semibold rounded-lg hover:bg-[#FFDC61]/90 transition-colors"
          >
            Talk to Daisy
          </Link>
        </div>
      </div>
    </div>
  )
}
