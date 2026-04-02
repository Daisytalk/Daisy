import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, signAdminSessionToken } from '@/shared/lib/admin-auth'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!getVerifiedAuthFromRequest(request)) {
    return NextResponse.json(
      { message: 'Сначала войдите в аккаунт Daisy.', code: 'user_auth' },
      { status: 401 }
    )
  }

  const secret = process.env.ADMIN_SECRET
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { message: 'Админка не настроена (ADMIN_SECRET).' },
      { status: 503 }
    )
  }

  let body: { secret?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Некорректный JSON' }, { status: 400 })
  }

  if (body.secret !== secret) {
    return NextResponse.json({ message: 'Неверный пароль' }, { status: 401 })
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
