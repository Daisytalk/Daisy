import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'

function getToken(request: NextRequest): string | null {
  const cookie = request.cookies.get('auth_token')?.value
  if (cookie) return cookie
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7)
  return null
}

/**
 * GET /api/account/style
 * Returns the user's current communication style preference
 */
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { aiProfile: true },
    })

    if (!user) return NextResponse.json({ error: apiMessages.userNotFound }, { status: 404 })

    const aiProfile = user.aiProfile as Record<string, unknown> | null
    const styles = aiProfile?.communication_style ?? []

    return NextResponse.json({ styles })
  } catch (error) {
    console.error('Get style error:', error)
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}

/**
 * PATCH /api/account/style
 * Updates the user's communication style preference
 * Body: { styles: string[] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    const { styles } = await request.json() as { styles: string[] }

    if (!Array.isArray(styles)) {
      return NextResponse.json({ error: 'styles must be an array' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { aiProfile: true },
    })

    if (!user) return NextResponse.json({ error: apiMessages.userNotFound }, { status: 404 })

    const existingProfile = (user.aiProfile as Record<string, unknown>) ?? {}
    const updatedProfile = { ...existingProfile, communication_style: styles }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { aiProfile: updatedProfile },
    })

    return NextResponse.json({ message: 'Style updated', styles })
  } catch (error) {
    console.error('Update style error:', error)
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}
