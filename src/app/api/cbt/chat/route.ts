import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/shared/lib/auth';
import prisma from '@/shared/lib/database';
import { sendChatMessage } from '@/shared/lib/ai-api';
import { apiMessages } from '@/shared/api-messages';
import { redactPII } from '@/shared/lib/pii/redactor';
import { prepareContentForStorage, getDecryptedContent } from '@/shared/lib/cbt-message-content';

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
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: apiMessages.userNotFound }, { status: 404 });
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
      return NextResponse.json({ error: apiMessages.messageRequired }, { status: 400 });
    }

    const { redacted: messageToStore } = redactPII(message.trim());

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
        content: prepareContentForStorage(messageToStore),
        diagnosis: [],
      },
    });

    // 5. Call Azure ML API
    console.log('🔵 Calling Azure ML API:', {
      userId: user.id,
      messageLength: message.length,
      conversationId: conversation.id,
      timestamp: new Date().toISOString()
    });

    const aiResponse = await sendChatMessage(
      messageToStore,
      user.id,
      sessionId || conversation.id
    );

    console.log('✅ Azure ML API response received:', {
      hasResponse: !!aiResponse.response,
      responseLength: aiResponse.response?.length,
      protocol: aiResponse.protocol_used,
      persona: aiResponse.persona_used
    });

    // 6. Save assistant response to database
    const assistantMessage = await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: prepareContentForStorage(aiResponse.response),
        protocol: aiResponse.protocol_used,
        diagnosis: aiResponse.diagnosis || [],
        persona: aiResponse.persona_used,
      },
    });

    // 7. Return response (aiResponse.response уже plaintext)
    return NextResponse.json({
      message: aiResponse.response ?? '',
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      protocol: aiResponse.protocol_used,
      diagnosis: aiResponse.diagnosis,
      persona: aiResponse.persona_used,
    });
  } catch (error) {
    console.error('❌ CBT Chat API error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      {
        error: apiMessages.failedToProcessMessage,
        details: error instanceof Error ? error.message : apiMessages.internalServerError,
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
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const conversation = await prisma.cbtConversation.findFirst({
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

      if (!conversation) return NextResponse.json({ error: apiMessages.conversationNotFound }, { status: 404 })

      return NextResponse.json({
        ...conversation,
        messages: conversation.messages.map((m) => ({
          ...m,
          content: getDecryptedContent(m.content),
        })),
      });
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

      return NextResponse.json(
        conversations.map((c) => ({
          ...c,
          messages: c.messages.map((m) => ({ ...m, content: getDecryptedContent(m.content) })),
        }))
      );
    }
  } catch (error) {
    console.error('Get CBT conversations error:', error);
    return NextResponse.json(
      { error: apiMessages.failedToRetrieveConversations },
      { status: 500 }
    );
  }
}
