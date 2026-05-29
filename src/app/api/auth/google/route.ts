import { NextRequest, NextResponse } from 'next/server'
import { apiMessages } from '@/shared/api-messages'
import { captureOAuthLocaleFromRequest, OAUTH_LOCALE_COOKIE } from '@/shared/lib/locale-detection'

export const dynamic = 'force-dynamic'

const OAUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 600,
  path: '/',
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/callback/google`

  if (!clientId) {
    console.error('Google OAuth: GOOGLE_CLIENT_ID is not set in .env')
    return NextResponse.json(
      { message: apiMessages.oauthConfigError },
      { status: 500 }
    )
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')

  const state = crypto.randomUUID()
  googleAuthUrl.searchParams.set('state', state)

  const oauthLocale = captureOAuthLocaleFromRequest(request)
  const response = NextResponse.redirect(googleAuthUrl.toString())
  response.cookies.set('oauth_state', state, OAUTH_COOKIE_OPTS)
  response.cookies.set(OAUTH_LOCALE_COOKIE, oauthLocale, OAUTH_COOKIE_OPTS)

  return response
}
