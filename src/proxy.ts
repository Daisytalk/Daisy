import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { detectLocale, LOCALE_COOKIE } from '@/shared/lib/locale-detection'

const intlMiddleware = createIntlMiddleware(routing)

const API_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
}

function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(API_SECURITY_HEADERS)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value)
    }
  }
  return response
}

function guardDebugRoutes(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') return null
  if (!request.nextUrl.pathname.startsWith('/api/debug')) return null

  const expected = process.env.DEBUG_ROUTE_SECRET
  const provided = request.headers.get('x-debug-secret')
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return null
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    const blocked = guardDebugRoutes(request)
    if (blocked) return blocked
    return applyApiSecurityHeaders(NextResponse.next())
  }

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
  matcher: ['/api/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
}
