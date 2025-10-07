import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { AuthService } from '@/shared/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    if (!code) return NextResponse.json({ message: 'Missing code' }, { status: 400 })

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT || 'http://localhost:3000/(auth)/oauth/success'

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
    const idToken = tokenJson.id_token
    const accessToken = tokenJson.access_token

    // Fetch userinfo
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfoRes.ok) {
      return NextResponse.json({ message: 'Failed to fetch user info' }, { status: 500 })
    }

    const profile = await userInfoRes.json()
    const email = profile.email
    const name = profile.name || profile.email.split('@')[0]

    // upsert user
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { name, email, password: '' } })
      await prisma.onboardingData.create({ data: { userId: user.id, responses: {}, completed: false } })
      await prisma.aiSession.create({ data: { userId: user.id, messages: [], context: { persona: 'intake_specialist' } } })
    }

    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      isOnboarded: false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscriptionStatus: 'trial',
      trialEndsAt: null,
    } as any)

    // Return a tiny HTML that posts the token back to the client and redirects
    const safeToken = JSON.stringify(token)
    const html = `<!doctype html><html><body>
    <script>
      try {
        localStorage.setItem('auth_token', ${safeToken})
      } catch(e) { /* ignore */ }
      window.location = '/dashboard'
    </script>
    </body></html>`

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    console.error('OAuth callback error', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
