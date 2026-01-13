import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales, type Locale } from './src/shared/lib/i18n'

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound()

  return {
    locale: locale as string,
    messages: (await import(`./src/shared/lib/i18n/messages/${locale}.json`)).default
  }
})