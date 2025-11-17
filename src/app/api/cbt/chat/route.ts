import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/shared/lib/auth';
import prisma from '@/shared/lib/database';
import { cbtApi } from '@/shared/lib/cbt-api';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    let token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Parse request
    const body = await req.json();
    const {
      message,
      persona = 'active_listener',
      conversationId,
      sessionId,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 3. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.cbtConversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      conversation = await prisma.cbtConversation.create({
        data: {
          userId: user.id,
          persona,
          sessionId: sessionId || undefined,
        },
      });
    }

    // 4. Save user message to database
    await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        diagnosis: [],
      },
    });

    // 5. Call CBT Therapy API
    const cbtResponse = await cbtApi.chat({
      text: message,
      user_id: user.id,
      persona,
      session_id: sessionId,
    });

    // 6. Save assistant response to database
    const assistantMessage = await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: cbtResponse.response,
        protocol: cbtResponse.protocol_used,
        diagnosis: cbtResponse.diagnosis || [],
        persona: cbtResponse.persona_used,
      },
    });

    // 7. Return response
    return NextResponse.json({
      message: cbtResponse.response,
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      protocol: cbtResponse.protocol_used,
      diagnosis: cbtResponse.diagnosis,
      persona: cbtResponse.persona_used,
    });
  } catch (error) {
    console.error('CBT Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history
export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get specific conversation
      const conversation = await prisma.cbtConversation.findUnique({
        where: {
          id: conversationId,
          userId: decoded.userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return NextResponse.json(conversation);
    } else {
      // Get all user conversations
      const conversations = await prisma.cbtConversation.findMany({
        where: { userId: decoded.userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('Get CBT conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}
