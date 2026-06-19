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

    // Fetch user's conversations
    const conversations = await prisma.cbtConversation.findMany({
      where: { userId: decoded.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1 // Just get first message for preview
        }
      }
    })

    // Format conversations for response
    const formattedConversations = conversations.map(conversation => {
      const firstMessage = conversation.messages[0]
      let title = 'New Conversation'
      
      if (firstMessage && firstMessage.role === 'user') {
        const text = getDecryptedContent(firstMessage.content)
        title = text.substring(0, 50) + (text.length > 50 ? '...' : '')
      }

      return {
        id: conversation.id,
        title,
        persona: conversation.persona,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error: any) {
    console.error('Conversations API error:', error)
    return NextResponse.json(
      { error: error.message || apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
