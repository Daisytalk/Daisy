import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, getAdminJwtSecret, signAdminSessionToken } from '@/shared/lib/admin-auth'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { adminStringsEqual } from '@/shared/lib/admin-credentials'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!getVerifiedAuthFromRequest(request)) {
    return NextResponse.json(
      { message: 'Сначала войдите в аккаунт Daisy.', code: 'user_auth' },
      { status: 401 }
    )
  }

  if (!getAdminJwtSecret()) {
    return NextResponse.json(
      { message: 'Админка не настроена: задайте ADMIN_JWT_SECRET (или ADMIN_SECRET) не короче 16 символов.' },
      { status: 503 }
    )
  }

  let body: { login?: string; password?: string; secret?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Некорректный JSON' }, { status: 400 })
  }

  const expectedLogin = process.env.ADMIN_LOGIN?.trim()
  const expectedPassword = process.env.ADMIN_PASSWORD
  const login = typeof body.login === 'string' ? body.login.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  const hasLoginPassword =
    Boolean(expectedLogin && expectedPassword && expectedPassword.length >= 16)
  const legacySecret = process.env.ADMIN_SECRET
  const hasLegacySecret = Boolean(legacySecret && legacySecret.length >= 16)

  if (!hasLoginPassword && !hasLegacySecret) {
    return NextResponse.json(
      {
        message:
          'Админка не настроена: задайте ADMIN_LOGIN и ADMIN_PASSWORD (пароль ≥16 символов), либо только ADMIN_SECRET (старый режим).',
      },
      { status: 503 }
    )
  }

  let ok = false
  if (hasLoginPassword) {
    ok =
      Boolean(login && password) &&
      adminStringsEqual(login, expectedLogin!) &&
      adminStringsEqual(password, expectedPassword!)
  } else if (hasLegacySecret) {
    const secret = typeof body.secret === 'string' ? body.secret : ''
    ok = Boolean(secret) && adminStringsEqual(secret, legacySecret!)
  }

  if (!ok) {
    return NextResponse.json({ message: 'Неверный логин или пароль' }, { status: 401 })
  }

  const token = signAdminSessionToken()
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const isSecure =
    process.env.NODE_ENV === 'production' || forwardedProto === 'https' || request.nextUrl.protocol === 'https:'

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
