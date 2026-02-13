import { NextRequest, NextResponse } from 'next/server'

/**
 * Альтернативный OAuth start. Основной — /api/auth/google.
 * Оставлен для обратной совместимости.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/callback/google`
  const scope = encodeURIComponent('openid email profile')
  const state = crypto.randomUUID()

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&access_type=offline&prompt=consent&state=${state}`

  return NextResponse.redirect(url)
}
