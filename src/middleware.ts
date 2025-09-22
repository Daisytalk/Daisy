import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/newsletter',
    '/api/onboarding/questions',
    '/terms',
    '/privacy'
  ]

  // Admin routes that require special permissions
  const adminRoutes = ['/admin']

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/chat',
    '/onboarding'
  ]

  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get the token from cookies or headers
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If no token and trying to access protected route, redirect to login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For admin routes, you might want to add additional checks here
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Add admin permission check here if needed
    // For now, just allow if authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}