import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { detectLocale, LOCALE_COOKIE } from '@/shared/lib/locale-detection'

const intlMiddleware = createIntlMiddleware(routing)

/**
 * Next.js 16: используем только `proxy.ts` (не `middleware.ts`).
 * Корень `/` → редирект на `/en` или `/ru` по cookie / гео / Accept-Language.
 */
export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/' || pathname === '') {
    const locale = detectLocale(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    const response = NextResponse.redirect(url)
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return response
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
