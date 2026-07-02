import { readFile } from 'fs/promises'
import { join } from 'path'
import { routing } from '@/i18n/routing'

export async function getTermsArticleHtml(locale: string): Promise<string> {
  const resolvedLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale

  const filePath = join(process.cwd(), 'content', 'terms', `${resolvedLocale}.html`)
  try {
    return await readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}
