import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from '@/shared/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/waitlist',
    '/onboarding',
    '/onboarding/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/newsletter',
    '/api/onboarding/questions',
    '/api/waitlist',
    '/api/admin/waitlist',
    '/api/test-db',
    '/api/env-test',
    '/terms',
    '/privacy',
  ]

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const decoded = AuthService.verifyToken(token)

    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }

    const { isOnboarded } = decoded

    if (!isOnboarded) {
      if (pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } else {
      if (pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
