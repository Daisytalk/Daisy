import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getDecryptedContent } from '@/shared/lib/cbt-message-content'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })
    }

    const conversations = await prisma.cbtConversation.findMany({
      where: { userId: decoded.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, role: true, content: true },
        },
      },
    })

    const sessions = conversations.map((conv) => {
      const messages = conv.messages
      const firstUser = messages.find((m) => m.role === 'user')
      const decryptedContent = firstUser?.content ? getDecryptedContent(firstUser.content) : ''
      const title = decryptedContent
        ? decryptedContent.substring(0, 50) + (decryptedContent.length > 50 ? '...' : '')
        : 'New Conversation'

      return {
        id: conv.id,
        title,
        messageCount: messages.length,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        persona: conv.persona || 'intake_specialist',
      }
    })

    return NextResponse.json({ sessions })
  } catch (error: unknown) {
    console.error('Sessions API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
