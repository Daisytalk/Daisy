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
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative bg-gray-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D1E2D3] to-[#7E9EC4]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            The Science Behind Daisy
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl leading-relaxed">
            Explore the latest scientific research on artificial intelligence and digital solutions 
            in supporting mental health care.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/${locale}/science/${paper.slug}`}
              className="group"
            >
              <article className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-gray-900 transition-all hover:shadow-2xl">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={paper.imageUrl}
                    alt={paper.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="text-xs text-gray-500 mb-3 font-medium">
                    <time>{paper.date}</time>
                    <span className="mx-2">•</span>
                    <span>{paper.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2 leading-tight">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    {paper.authors} ({paper.year})
                  </p>
                  <p className="text-gray-600 line-clamp-3 flex-1 leading-relaxed">
                    {paper.abstract.split('\n\n')[0]}
                  </p>
                  <div className="mt-6 inline-flex items-center text-gray-900 font-semibold group-hover:gap-2 transition-all">
                    <span>Read more</span>
                    <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Experience Evidence-Based Mental Health Support
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Daisy combines the latest AI research with proven therapeutic techniques to provide 
            accessible, personalized mental health care.
          </p>
          <Link
            href={`/${locale}/onboarding`}
            className="inline-block px-8 py-4 bg-[#FFDC61] text-black font-semibold rounded-full hover:bg-[#FFDC61]/90 transition-colors shadow-xl"
          >
            Talk to Daisy
          </Link>
        </div>
      </div>
    </div>
  )
}
