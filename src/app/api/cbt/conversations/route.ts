import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Authentication
    let token = request.cookies.get('auth_token')?.value

    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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
        const text = firstMessage.content
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
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
