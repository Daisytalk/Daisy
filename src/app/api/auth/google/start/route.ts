import { NextResponse } from 'next/server'
import { env } from '@/shared/config/env'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/(auth)/oauth/success'
  const scope = encodeURIComponent('openid email profile')
  const state = 'daisy' // TODO: implement CSRF/state in production

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&access_type=offline&prompt=consent&state=${state}`

  return NextResponse.redirect(url)
}
