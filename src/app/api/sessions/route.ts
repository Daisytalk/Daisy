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

    // Fetch user's sessions
    const sessions = await prisma.aiSession.findMany({
      where: { userId: decoded.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
        context: true,
      },
    })

    // Format sessions for response
    const formattedSessions = sessions.map(session => {
      const messages = Array.isArray(session.messages) ? session.messages : []
      const messageCount = messages.length
      
      // Get first user message as title
      let title = 'New Conversation'
      if (messageCount > 0) {
        const firstUserMessage = messages.find((msg: any) => msg.role === 'user')
        if (firstUserMessage && firstUserMessage.parts && firstUserMessage.parts[0]) {
          const text = firstUserMessage.parts[0].text || ''
          title = text.substring(0, 50) + (text.length > 50 ? '...' : '')
        }
      }

      return {
        id: session.id,
        title,
        messageCount,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        persona: (session.context as any)?.persona || 'intake_specialist',
      }
    })

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error: any) {
    console.error('Sessions API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
