import { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from '@/i18n';

const LOCALE_COOKIE = 'NEXT_LOCALE';

// Russian-speaking countries
const RUSSIAN_SPEAKING_COUNTRIES = new Set([
  'RU', 'KZ', 'BY', 'UA', 'KG', 'TJ', 'UZ', 'TM', 'AM', 'AZ', 'GE', 'MD'
]);

/**
 * Parse Accept-Language header and find best matching locale
 */
function parseAcceptLanguage(acceptLanguage: string): Locale {
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header (format: "en-US,en;q=0.9,ru;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';q=');
      const quality = qValue ? parseFloat(qValue) : 1.0;
      const langCode = locale.split('-')[0].toLowerCase();
      return { langCode, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first matching locale (currently only 'ru' is supported)
  for (const { langCode } of languages) {
    if (langCode === 'ru') return 'ru';
  }

  return defaultLocale;
}

/**
 * Detect locale from country header (optional, weak signal)
 */
function detectFromCountry(request: NextRequest): Locale | null {
  // Check various country headers (Cloudflare, custom, etc.)
  const country = 
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country') ||
    request.headers.get('x-vercel-ip-country');

  if (!country) return null;

  // If country is Russian-speaking, prefer Russian
  if (RUSSIAN_SPEAKING_COUNTRIES.has(country.toUpperCase())) {
    return 'ru';
  }

  return null;
}

/**
 * Detect user's preferred locale based on multiple signals
 * Priority: Cookie > Accept-Language > Country hint > Default
 */
export function detectLocale(request: NextRequest): Locale {
  // 1. Check cookie (highest priority - user's explicit choice)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const detectedLocale = parseAcceptLanguage(acceptLanguage);
    if (detectedLocale !== defaultLocale) {
      return detectedLocale;
    }
  }

  // 3. Optional: Check country hint (weak signal)
  const countryLocale = detectFromCountry(request);
  if (countryLocale) {
    return countryLocale;
  }

  // 4. Default fallback
  return defaultLocale;
}

/**
 * Get locale from pathname (e.g., /en/about -> 'en')
 */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  
  return null;
}

/**
 * Check if pathname already has a locale prefix
 */
export function hasLocalePrefix(pathname: string): boolean {
  return getLocaleFromPathname(pathname) !== null;
}

/**
 * Cookie name for locale preference
 */
export { LOCALE_COOKIE };
