import type { MetadataRoute } from 'next'
import { researchPapers } from '@/shared/data/research-papers'
import { getSiteUrl } from '@/shared/lib/seo'
import { defaultLocale } from '@/i18n'

/** Публичные маршруты для индексации (без кабинета и чата) */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/science', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/resources', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/crisis-resources', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/refund', changeFrequency: 'yearly', priority: 0.5 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const locale = defaultLocale
  const prefix = `/${locale}`

  const entries: MetadataRoute.Sitemap = []

  for (const { path, changeFrequency, priority } of PUBLIC_PATHS) {
    entries.push({
      url: `${base}${prefix}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })
  }

  for (const paper of researchPapers) {
    entries.push({
      url: `${base}${prefix}/science/${paper.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    })
  }

  return entries
}
