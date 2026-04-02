/** Базовый URL сайта для canonical, OG, sitemap (без завершающего /) */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://talktodaisy.com'
  return raw.replace(/\/$/, '')
}

export const DEFAULT_SITE_TITLE =
  'Daisy — качественные разговоры о ментальном здоровье'

export const DEFAULT_SITE_DESCRIPTION =
  'Безопасное пространство без осуждения: поддержка и ясные шаги к внутреннему балансу. На основе научных подходов, 24/7.'

/** Canonical URL для страницы (path без префикса локали, например `/pricing` или ``). */
export function canonicalUrl(locale: string, path = ''): string {
  const base = getSiteUrl()
  const segment = path.startsWith('/') ? path : path ? `/${path}` : ''
  return `${base}/${locale}${segment}`
}
