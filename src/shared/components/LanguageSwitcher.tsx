'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { locales, type Locale } from '@/i18n'
import { LOCALE_COOKIE } from '@/shared/lib/locale-detection'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return

    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')

    router.push(newPath)
    router.refresh()
  }

  useEffect(() => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [locale])

  return (
    <div className="inline-flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-0.5 border border-white/10">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            locale === loc
              ? 'bg-white text-gray-900'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          aria-label={`Switch to ${loc === 'en' ? 'English' : 'Russian'}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
