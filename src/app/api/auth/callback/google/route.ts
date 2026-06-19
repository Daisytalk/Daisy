import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { defaultLocale } from '@/shared/lib/i18n/config'
import { resolveAcquisitionFromRequest } from '@/shared/lib/attribution'
import {
  LOCALE_COOKIE,
  OAUTH_LOCALE_COOKIE,
  resolveOAuthRedirectLocale,
} from '@/shared/lib/locale-detection'

export const dynamic = 'force-dynamic'

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  id_token: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

/**
 * Определяем публичный origin.
 * Azure App Service проксирует трафик; request.nextUrl.origin может быть https://localhost:3000.
 * Используем NEXT_PUBLIC_APP_URL или заголовки x-forwarded-host / host.
 */
function getPublicOrigin(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = getPublicOrigin(request)
  const localePrefix = `/${defaultLocale}`

  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL(`${localePrefix}/login?error=${encodeURIComponent('OAuth authentication failed')}`, baseUrl)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${localePrefix}/login?error=missing_code`, baseUrl))
  }

  // Verify state parameter — fail closed (CSRF)
  const storedState = request.cookies.get('oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch or missing')
    return NextResponse.redirect(new URL(`${localePrefix}/login?error=invalid_state`, baseUrl))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${baseUrl}/api/auth/callback/google`

  if (!clientId || !clientSecret) {
    console.error('Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in .env')
    return NextResponse.redirect(
      new URL(`${localePrefix}/login?error=oauth_config_error`, baseUrl)
    )
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL(`${localePrefix}/login?error=token_exchange_failed`, baseUrl)
      )
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info')
      return NextResponse.redirect(
        new URL(`${localePrefix}/login?error=user_info_failed`, baseUrl)
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.verified_email) {
      return NextResponse.redirect(
        new URL(`${localePrefix}/login?error=email_not_verified`, baseUrl)
      )
    }

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    let isNewUser = false

    const acquisition = resolveAcquisitionFromRequest(
      undefined,
      request.cookies.get('daisy_attr')?.value
    )

    const redirectLocale = resolveOAuthRedirectLocale(request, user?.locale)

    if (!user) {
      isNewUser = true
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: googleUser.email.toLowerCase(),
            name: googleUser.name,
            password: '',
            googleId: googleUser.id,
            locale: redirectLocale,
            ...(acquisition && {
              acquisitionSource: acquisition.source,
              acquisitionDetail: acquisition.detail,
            }),
          },
        })

        await tx.onboardingData.create({
          data: {
            userId: newUser.id,
            responses: {},
            completed: false,
          },
        })

        await tx.aiSession.create({
          data: {
            userId: newUser.id,
            messages: [],
            context: { persona: 'intake_specialist' },
          },
        })

        return newUser
      })
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          googleId: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } else if (!user.locale || (user.locale !== 'ru' && user.locale !== 'en')) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { locale: redirectLocale },
        select: {
          id: true,
          email: true,
          name: true,
          googleId: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    // Check onboarding status
    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId: user.id },
    })

    const isOnboarded = onboardingData?.completed ?? false

    // Generate JWT token
    const trialEndsAt = isNewUser ? AuthService.generateTrialEndDate() : null
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      isOnboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscriptionStatus: isNewUser ? 'trial' : 'active',
      trialEndsAt,
    })

    const redirectPath = `/${redirectLocale}/auth/oauth-complete`
    const redirectUrl = new URL(redirectPath, baseUrl)
    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set(LOCALE_COOKIE, redirectLocale, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    response.cookies.delete('oauth_state')
    response.cookies.delete(OAUTH_LOCALE_COOKIE)
    response.cookies.delete('daisy_attr')

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`${localePrefix}/login?error=oauth_failed`, baseUrl)
    )
  }
}
