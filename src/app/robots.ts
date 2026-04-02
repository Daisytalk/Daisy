import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/shared/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  const locale = 'ru'
  const p = `/${locale}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          `${p}/chat`,
          `${p}/chat-improved`,
          `${p}/cbt-chat`,
          `${p}/profile`,
          `${p}/settings`,
          `${p}/history`,
          `${p}/dashboard`,
          `${p}/onboarding`,
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
