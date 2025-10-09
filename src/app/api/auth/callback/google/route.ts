import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Check for OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('OAuth authentication failed')}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', request.url)
    )
  }

  // Verify state parameter
  const storedState = request.cookies.get('oauth_state')?.value
  if (state !== storedState) {
    console.error('State mismatch in OAuth callback')
    return NextResponse.redirect(
      new URL('/login?error=invalid_state', request.url)
    )
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured')
    return NextResponse.redirect(
      new URL('/login?error=oauth_config_error', request.url)
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
        new URL('/login?error=token_exchange_failed', request.url)
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
        new URL('/login?error=user_info_failed', request.url)
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    })

    let isNewUser = false

    if (!user) {
      // Create new user
      isNewUser = true
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: googleUser.email.toLowerCase(),
            name: googleUser.name,
            password: '', // No password for OAuth users
            googleId: googleUser.id,
          },
        })

        // Create onboarding data
        await tx.onboardingData.create({
          data: {
            userId: newUser.id,
            responses: {},
            completed: false,
          },
        })

        // Create AI session
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
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.id },
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

    // Redirect to dashboard with token in cookie
    const redirectUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state')

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url)
    )
  }
}
