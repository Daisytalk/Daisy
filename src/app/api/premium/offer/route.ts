import { NextRequest, NextResponse } from 'next/server'
import { checkPremiumTrigger } from '@/shared/lib/premium-triggers'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const offer = await checkPremiumTrigger(decoded.userId)

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Premium offer check error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
