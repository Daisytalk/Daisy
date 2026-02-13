import { NextRequest, NextResponse } from 'next/server'
import { apiMessages } from '@/shared/api-messages'

export const dynamic = 'force-dynamic'

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

  // Build Google OAuth URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')

  // Add state parameter for security (optional but recommended)
  const state = crypto.randomUUID()
  googleAuthUrl.searchParams.set('state', state)

  // Store state in cookie for verification in callback
  const response = NextResponse.redirect(googleAuthUrl.toString())
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
