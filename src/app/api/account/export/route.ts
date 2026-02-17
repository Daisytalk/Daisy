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
 * GET /api/account/export
 * GDPR: экспорт всех данных пользователя (профиль, онбординг, диалоги, память)
 */
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    const userId = decoded.userId

    const [user, onboarding, conversations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          isOnboarded: true,
          subscriptionStatus: true,
          aiProfile: true,
          conversationMemory: true,
        },
      }),
      prisma.onboardingData.findUnique({
        where: { userId },
      }),
      prisma.cbtConversation.findMany({
        where: { userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      }),
    ])

    if (!user) return NextResponse.json({ error: apiMessages.userNotFound }, { status: 404 })

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        subscriptionStatus: user.subscriptionStatus,
        aiProfile: user.aiProfile,
        conversationMemory: user.conversationMemory,
      },
      onboarding: onboarding
        ? {
            responses: onboarding.responses,
            completed: onboarding.completed,
            completedAt: onboarding.updatedAt,
          }
        : null,
      conversations: conversations.map((c) => ({
        id: c.id,
        persona: c.persona,
        createdAt: c.createdAt,
        messages: c.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      })),
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Account export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
