import { NextRequest, NextResponse } from 'next/server'

/** Redirects to canonical OAuth handler that sets oauth_state cookie. */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/google', request.url))
}
