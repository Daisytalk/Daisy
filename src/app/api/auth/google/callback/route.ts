import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/shared/lib/database'
import { AuthService } from '@/shared/lib/auth'
import type { User } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'
import { resolveAcquisitionFromRequest } from '@/shared/lib/attribution'
import {
  LOCALE_COOKIE,
  OAUTH_LOCALE_COOKIE,
  resolveOAuthRedirectLocale,
} from '@/shared/lib/locale-detection'
import { defaultLocale } from '@/i18n'

/**
 * Альтернативный callback (/api/auth/google/callback).
 * Основной callback — /api/auth/callback/google (тот что в Google Console).
 */
export async function GET(req: NextRequest) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '')

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    // State verification — CSRF protection for OAuth flow
    const stateFromGoogle = searchParams.get('state')
    const stateFromCookie = req.cookies.get('oauth_state')?.value

    if (!stateFromGoogle || !stateFromCookie || stateFromGoogle !== stateFromCookie) {
      const response = NextResponse.redirect(new URL('/login?error=state_mismatch', baseUrl))
      response.cookies.delete('oauth_state')
      return response
    }

    if (!code) return NextResponse.json({ message: apiMessages.missingCode }, { status: 400 })

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
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', baseUrl))
    }

    const tokenJson = await tokenRes.json()
    const accessToken = tokenJson.access_token

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfoRes.ok) {
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', baseUrl))
    }

    const profile = await userInfoRes.json()
    const email = profile.email
    const name = profile.name || profile.email.split('@')[0]

    let user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, locale: true, createdAt: true, updatedAt: true } })
    const acquisition = resolveAcquisitionFromRequest(undefined, req.cookies.get('daisy_attr')?.value)
    const redirectLocale = resolveOAuthRedirectLocale(req, user?.locale)

    if (!user) {
      // OAuth users get a random unguessable password — they authenticate via Google only
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: crypto.randomBytes(32).toString('hex'),
          locale: redirectLocale,
          ...(acquisition && {
            acquisitionSource: acquisition.source,
            acquisitionDetail: acquisition.detail,
          }),
        },
      })
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
    const authToken = AuthService.generateToken(tokenPayload)

    const redirectPath = `/${redirectLocale}/auth/oauth-complete`

    // Set httpOnly cookie — no localStorage, no XSS exposure
    const redirectResponse = NextResponse.redirect(new URL(redirectPath, baseUrl))
    redirectResponse.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // lax required for OAuth redirect cross-site flow
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    redirectResponse.cookies.set(LOCALE_COOKIE, redirectLocale, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    redirectResponse.cookies.delete('oauth_state')
    redirectResponse.cookies.delete(OAUTH_LOCALE_COOKIE)
    redirectResponse.cookies.delete('daisy_attr')
    return redirectResponse
  } catch (err) {
    console.error('OAuth callback error', err)
    return NextResponse.redirect(new URL(`/${defaultLocale}/login?error=oauth_failed`, baseUrl))
  }
}
