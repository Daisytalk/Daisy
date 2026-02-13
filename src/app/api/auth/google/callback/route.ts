import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { AuthService } from '@/shared/lib/auth'
import type { User } from '@/shared/types/auth'

/**
 * Альтернативный callback (/api/auth/google/callback).
 * Основной callback — /api/auth/callback/google (тот что в Google Console).
 * Этот маршрут использует HTML-ответ для сохранения токена в localStorage.
 */
export async function GET(req: NextRequest) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '')

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    if (!code) return NextResponse.json({ message: 'Missing code' }, { status: 400 })

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${baseUrl}/api/auth/callback/google`

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const txt = await tokenRes.text()
      return NextResponse.json({ message: 'Token exchange failed', detail: txt }, { status: 500 })
    }

    const tokenJson = await tokenRes.json()
    const accessToken = tokenJson.access_token

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfoRes.ok) {
      return NextResponse.json({ message: 'Failed to fetch user info' }, { status: 500 })
    }

    const profile = await userInfoRes.json()
    const email = profile.email
    const name = profile.name || profile.email.split('@')[0]

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { name, email, password: '' } })
      await prisma.onboardingData.create({ data: { userId: user.id, responses: {}, completed: false } })
      await prisma.aiSession.create({ data: { userId: user.id, messages: [], context: { persona: 'intake_specialist' } } })
    }

    const onboardingData = await prisma.onboardingData.findUnique({ where: { userId: user.id } })
    const isOnboarded = onboardingData?.completed ?? false

    const tokenPayload: User = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      isOnboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscriptionStatus: 'trial',
      trialEndsAt: null,
    }
    const token = AuthService.generateToken(tokenPayload)

    const locale = 'ru'
    const redirectPath = !isOnboarded ? `/${locale}/onboarding` : `/${locale}/chat`
    const safeToken = JSON.stringify(token)
    const html = `<!doctype html><html><body>
    <script>
      try {
        localStorage.setItem('auth_token', ${safeToken})
      } catch(e) { /* ignore */ }
      window.location = '${redirectPath}'
    </script>
    </body></html>`

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    console.error('OAuth callback error', err)
    return NextResponse.redirect(new URL('/ru/login?error=oauth_failed', baseUrl))
  }
}
