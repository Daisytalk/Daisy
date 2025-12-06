import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware with proper configuration
const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  console.log('🔍 MIDDLEWARE HIT:', {
    pathname: request.nextUrl.pathname,
    searchParams: request.nextUrl.searchParams.toString(),
    method: request.method,
  });

  const response = handleI18nRouting(request);

  console.log('📤 MIDDLEWARE RESPONSE:', {
    status: response.status,
    statusText: response.statusText,
    redirected: response.redirected,
    location: response.headers.get('location'),
  });

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};