
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from '@/shared/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // Define public routes that don't require authentication
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
    '/privacy',
  ]

  // Allow public routes to be accessed
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // If there's no token, redirect to login for any protected route
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If there is a token, verify it
  try {
    const decoded = AuthService.verifyToken(token)

    // If token is invalid or expired
    if (!decoded) {
      // Clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }

    const { isOnboarded } = decoded
    
    // User is authenticated, but hasn't completed onboarding
    if (!isOnboarded) {
      // If they are not on the onboarding page, redirect them there.
      if (pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } else {
      // If user is onboarded, they shouldn't access the onboarding page again
      if (pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Allow access to the requested page if all checks pass
    return NextResponse.next()
    
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error during token verification, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }
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
