import { createNavigation } from 'next-intl/navigation'
import { routing } from '@/i18n/routing'

export const locales = routing.locales
export type Locale = (typeof routing.locales)[number]

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
})

export const defaultLocale: Locale = routing.defaultLocale as Locale