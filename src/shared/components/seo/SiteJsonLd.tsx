import { getSiteUrl, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE } from '@/shared/lib/seo'

type Props = { locale: string }

/**
 * Schema.org Organization + WebSite для расширенных сниппетов в поиске.
 */
export function SiteJsonLd({ locale }: Props) {
  const base = getSiteUrl()
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Daisy',
    url: base,
    logo: `${base}/images/daisy-icon.svg`,
    description: DEFAULT_SITE_DESCRIPTION,
    sameAs: [] as string[],
  }
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_SITE_TITLE,
    url: `${base}/${locale}`,
    description: DEFAULT_SITE_DESCRIPTION,
    inLanguage: locale === 'ru' ? 'ru-RU' : locale,
    publisher: { '@type': 'Organization', name: 'Daisy', url: base },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  )
}
