import { NextRequest } from 'next/server'
import { defaultLocale, locales, type Locale } from '@/i18n'

/** Совпадает с cookie next-intl (`NEXT_LOCALE`). */
export const LOCALE_COOKIE = 'NEXT_LOCALE'

/** Страны, где по умолчанию показываем русский интерфейс (гео из CDN / прокси). */
const RUSSIAN_SPEAKING_COUNTRIES = new Set([
  'RU',
  'KZ',
  'BY',
  'UA',
  'KG',
  'TJ',
  'UZ',
  'TM',
  'AM',
  'AZ',
  'GE',
  'MD',
])

/**
 * Разбор Accept-Language: первый подходящий из поддерживаемых (ru, en).
 */
function parseAcceptLanguage(acceptLanguage: string): Locale {
  if (!acceptLanguage) return defaultLocale

  const entries = acceptLanguage.split(',').map((part) => {
    const [tag, qPart] = part.trim().split(';q=')
    const quality = qPart ? parseFloat(qPart) : 1
    const langCode = tag.split('-')[0].toLowerCase()
    return { langCode, quality: Number.isFinite(quality) ? quality : 1 }
  })
  entries.sort((a, b) => b.quality - a.quality)

  for (const { langCode } of entries) {
    if (langCode === 'ru' || langCode === 'en') return langCode as Locale
  }

  return defaultLocale
}

/**
 * Геолокация по стране (заголовки от хостинга / CDN).
 * Если страна неизвестна — null (тогда сработает Accept-Language).
 */
function detectFromCountry(request: NextRequest): Locale | null {
  const country =
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country') ||
    request.headers.get('cloudfront-viewer-country')

  if (!country || country === 'XX' || country.length !== 2) return null

  const c = country.toUpperCase()
  if (RUSSIAN_SPEAKING_COUNTRIES.has(c)) return 'ru'
  return 'en'
}

/**
 * Предпочтительная локаль для первого визита.
 * Приоритет: явный выбор в cookie → гео (страна) → язык браузера → ru.
 */
export function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  const countryLocale = detectFromCountry(request)
  if (countryLocale) {
    return countryLocale
  }

  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    return parseAcceptLanguage(acceptLanguage)
  }

  return defaultLocale
}

/**
 * Локаль из pathname (например /en/about → en).
 */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]
  if (potentialLocale && locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale
  }
  return null
}

export function hasLocalePrefix(pathname: string): boolean {
  return getLocaleFromPathname(pathname) !== null
}
