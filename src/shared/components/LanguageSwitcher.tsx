'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { locales, type Locale } from '@/i18n'
import { LOCALE_COOKIE } from '@/shared/lib/locale-detection'

type Variant = 'light' | 'dark'

export function LanguageSwitcher({ variant = 'dark' }: { variant?: Variant }) {
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

  const isLight = variant === 'light'

  return (
    <div className={`inline-flex items-center gap-1 rounded-lg p-0.5 ${
      isLight ? 'bg-muted/50 border border-[hsl(var(--app-border))]' : 'bg-white/5 backdrop-blur-sm border border-white/10'
    }`}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            locale === loc
              ? isLight ? 'bg-primary text-primary-foreground' : 'bg-white text-gray-900'
              : isLight ? 'text-muted-foreground hover:text-foreground hover:bg-muted/70' : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          aria-label={`Switch to ${loc === 'en' ? 'English' : loc === 'ru' ? 'Russian' : 'Kazakh'}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
