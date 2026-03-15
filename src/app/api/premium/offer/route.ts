import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import { checkPremiumTrigger } from '@/shared/lib/premium-triggers'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const offer = await checkPremiumTrigger(decoded.userId)

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Premium offer check error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
