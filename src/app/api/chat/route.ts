import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { cbtApi } from '@/shared/lib/cbt-api'

/**
 * Process chat request asynchronously
 * This runs in the background without blocking the response
 */
async function processAsyncChat(
  messageId: string,
  conversationId: string,
  userMessage: string,
  userId: string
) {
  try {
    console.log('🚀 Starting async chat processing:', {
      messageId,
      conversationId,
      userId,
      messagePreview: userMessage.substring(0, 50)
    })

    // Call CBT Therapy API
    console.log('📞 Calling CBT API...')
    const cbtResponse = await cbtApi.chat({
      text: userMessage,
      user_id: userId,
      session_id: conversationId,
    })

    console.log('✅ CBT API response received:', {
      protocol: cbtResponse.protocol_used,
      persona: cbtResponse.persona_used,
      responseLength: cbtResponse.response?.length || 0,
      hasResponse: !!cbtResponse.response
    })

    if (!cbtResponse.response) {
      throw new Error('No response content from CBT API')
    }

    // Save assistant response to database
    console.log('💾 Saving assistant response to database...')
    await prisma.cbtMessage.create({
      data: {
        conversationId: conversationId,
        role: 'assistant',
        content: cbtResponse.response,
        protocol: cbtResponse.protocol_used,
        diagnosis: cbtResponse.diagnosis || [],
        persona: cbtResponse.persona_used,
      },
    })

    // Update conversation with the persona used
    if (cbtResponse.persona_used) {
      await prisma.cbtConversation.update({
        where: { id: conversationId },
        data: {
          persona: cbtResponse.persona_used,
          updatedAt: new Date()
        }
      })
    }

    console.log('✅ Successfully saved assistant response for message:', messageId)

  } catch (error: any) {
    console.error('❌ Async processing error:', {
      messageId,
      error: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Save error message to database
    try {
      await prisma.cbtMessage.create({
        data: {
          conversationId: conversationId,
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your message. Please try again.',
          diagnosis: [],
        },
      })
      console.log('💾 Saved error message to database')
    } catch (dbError) {
      console.error('❌ Failed to save error message:', dbError)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const userMessageRecord = await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
        diagnosis: [],
      },
    })

    console.log('💾 Saved user message:', userMessageRecord.id)

    // Start async processing in background
    // Don't await - let it process asynchronously
    processAsyncChat(userMessageRecord.id, conversation.id, userMessage, user.id)
      .catch(error => {
        console.error('❌ Async chat processing failed:', error)
      })

    // Return immediately with request ID for polling
    return NextResponse.json({
      status: 'processing',
      requestId: userMessageRecord.id,
      conversationId: conversation.id,
      message: 'Your message is being processed...'
    }, {
      status: 202, // Accepted
      headers: {
        'X-Session-Id': conversation.id,
        'X-Request-Id': userMessageRecord.id,
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
