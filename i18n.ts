import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales } from './src/shared/lib/i18n'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: (await import(`./src/shared/lib/i18n/messages/${locale}.json`)).default
  }
})