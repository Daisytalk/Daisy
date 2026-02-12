import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    let token = request.cookies.get('auth_token')?.value
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7)
    }
    if (!token) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const conversation = await prisma.cbtConversation.findFirst({
      where: { id: params.id, userId: decoded.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!conversation) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    return NextResponse.json({
      id: conversation.id,
      messages: conversation.messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    })
  } catch (error: unknown) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    let token = request.cookies.get('auth_token')?.value
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7)
    }
    if (!token) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })

    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const result = await prisma.cbtConversation.deleteMany({
      where: { id: params.id, userId: decoded.userId },
    })

    if (result.count === 0) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Session delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
