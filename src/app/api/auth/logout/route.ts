import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { extractAuthToken } from '@/shared/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const token = extractAuthToken(request)

    if (token) {
      try {
        const decoded = await AuthService.validateSession(token, { allowDeactivated: true })

        if (decoded?.userId) {
          await prisma.user.update({
            where: { id: decoded.userId },
            data: { updatedAt: new Date() },
          }).catch(() => {})
        }

        await AuthService.blacklistToken(token, decoded?.userId ?? 'unknown')
      } catch {
        // invalid token — still clear cookie
      }
    }

    const response = NextResponse.json({
      message: 'Logged out successfully',
      success: true,
    })

    response.cookies.delete('auth_token')

    return response
  } catch {
    const response = NextResponse.json(
      { message: 'Logged out successfully', success: true },
      { status: 200 }
    )
    response.cookies.delete('auth_token')
    return response
  }
}
