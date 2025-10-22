import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variables
    console.log('🔍 Environment variables check:', {
      CBT_API_URL: process.env.CBT_API_URL || 'NOT SET',
      CBT_API_KEY: process.env.CBT_API_KEY ? '***SET***' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV
    })

    // Parse request body
    const body = await request.json()

    console.log('Raw request body keys:', Object.keys(body))
    console.log('Messages array length:', body.messages?.length)

    // Extract the latest user message
    let userMessage = ''
    if (Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1]

      // Handle different message formats
      if (typeof lastMessage === 'string') {
        userMessage = lastMessage
      } else if (lastMessage.content) {
        userMessage = typeof lastMessage.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage.content)
      } else if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        userMessage = lastMessage.parts
          .filter((part: any) => part.type === 'text' || part.text)
          .map((part: any) => part.text || part.content || '')
          .join('')
      }
    }

    if (!userMessage || userMessage.trim().length === 0) {
      console.warn('No valid user message found in request')
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    console.log('Extracted user message:', userMessage.substring(0, 100))

    // Authentication - try cookie first, then Bearer token
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get session ID from request body
    const sessionId = body.sessionId || body.id

    // Get or create CBT conversation based on sessionId
    let conversation
    if (sessionId && !sessionId.startsWith('temp_')) {
      // Try to find existing conversation
      conversation = await prisma.cbtConversation.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    }

    // Create new conversation if not found
    if (!conversation) {
      conversation = await prisma.cbtConversation.create({
        data: {
          userId: user.id,
          persona: 'active_listener', // Initial persona, will be determined by CBT API
          sessionId: sessionId || undefined,
        },
        include: {
          messages: true
        }
      })
      console.log('Created new CBT conversation:', conversation.id)
    } else {
      console.log('Using existing CBT conversation:', conversation.id)
    }

    // Save user message to database
    await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
        diagnosis: [],
      },
    })

    // Call CBT Therapy API
    // The CBT API will automatically determine the appropriate persona
    console.log('Calling CBT API for user:', user.id)
    const cbtResponse = await cbtApi.chat({
      text: userMessage,
      user_id: user.id,
      session_id: conversation.id,
      // Note: No persona specified - CBT API determines it automatically
    })

    console.log('CBT API response received:', {
      protocol: cbtResponse.protocol_used,
      persona: cbtResponse.persona_used,
      diagnosis: cbtResponse.diagnosis,
      responseLength: cbtResponse.response.length
    })

    // Save assistant response to database
    await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: cbtResponse.response,
        protocol: cbtResponse.protocol_used,
        diagnosis: cbtResponse.diagnosis || [],
        persona: cbtResponse.persona_used,
      },
    })

    // Update conversation with the persona used by CBT API
    if (cbtResponse.persona_used) {
      await prisma.cbtConversation.update({
        where: { id: conversation.id },
        data: {
          persona: cbtResponse.persona_used,
          updatedAt: new Date()
        }
      })
    }

    // Return response in the format expected by the frontend
    // Return as plain text for streaming compatibility
    return new NextResponse(cbtResponse.response, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': conversation.id,
        'X-Persona': cbtResponse.persona_used || 'active_listener',
        'X-Protocol': cbtResponse.protocol_used || 'general',
      }
    })


  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
