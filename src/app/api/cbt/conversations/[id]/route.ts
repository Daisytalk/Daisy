import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const conversationId = params.id

    // Authentication
    let token = request.cookies.get('auth_token')?.value

    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })
    }

    // Fetch conversation with messages
    const conversation = await prisma.cbtConversation.findFirst({
      where: {
        id: conversationId,
        userId: decoded.userId // Ensure user owns this conversation
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: apiMessages.conversationNotFound }, { status: 404 })
    }

    return NextResponse.json({
      id: conversation.id,
      persona: conversation.persona,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        protocol: msg.protocol,
        persona: msg.persona,
        diagnosis: msg.diagnosis,
        createdAt: msg.createdAt
      }))
    })
  } catch (error: any) {
    console.error('Conversation detail API error:', error)
    return NextResponse.json(
      { error: error.message || apiMessages.internalServerError },
      { status: 500 }
    )
  }
}
