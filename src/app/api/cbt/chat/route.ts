import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/shared/lib/database';
import { sendChatMessage } from '@/shared/lib/ai-api';
import { apiMessages } from '@/shared/api-messages';
import { redactPII } from '@/shared/lib/pii/redactor';
import { prepareContentForStorage, getDecryptedContent } from '@/shared/lib/cbt-message-content';
import { checkPremiumTrigger } from '@/shared/lib/premium-triggers';
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth';
import { rateLimitAI } from '@/shared/lib/rate-limit';
import { scanForInjection } from '@/shared/lib/input-guard';
import { logger } from '@/shared/lib/safe-logger';

export async function POST(req: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: apiMessages.userNotFound }, { status: 404 });
    }

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

    const HARD_MAX = 10_000;
    if (message.trim().length > HARD_MAX) {
      return NextResponse.json(
        { error: 'Сообщение слишком длинное. Попробуйте разбить на части.' },
        { status: 400 }
      );
    }

    if (scanForInjection(message)) {
      logger.warn('injection_attempt', { userId: user.id, length: message.length });
      return NextResponse.json(
        { error: 'Сообщение содержит недопустимый контент.' },
        { status: 400 }
      );
    }

    const { allowed, retryAfterMs } = await rateLimitAI(user.id, message);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Пожалуйста, подождите немного.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }

    const { redacted: messageToStore } = redactPII(message.trim());

    let conversation;
    if (conversationId) {
      conversation = await prisma.cbtConversation.findFirst({
        where: { id: conversationId, userId: user.id },
      });
      if (!conversation) {
        return NextResponse.json({ error: apiMessages.conversationNotFound }, { status: 404 });
      }
    } else {
      conversation = await prisma.cbtConversation.create({
        data: {
          userId: user.id,
          persona,
          sessionId: sessionId || undefined,
        },
      });
    }

    await prisma.cbtMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: prepareContentForStorage(messageToStore),
        diagnosis: [],
      },
    });

    const aiResponse = await sendChatMessage(
      messageToStore,
      user.id,
      sessionId || conversation.id
    );

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

    const offer = await checkPremiumTrigger(user.id);

    return NextResponse.json({
      message: aiResponse.response ?? '',
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      protocol: aiResponse.protocol_used,
      diagnosis: aiResponse.diagnosis,
      persona: aiResponse.persona_used,
      premiumOffer: offer,
    });
  } catch {
    return NextResponse.json(
      { error: apiMessages.failedToProcessMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 });
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

      if (!conversation) return NextResponse.json({ error: apiMessages.conversationNotFound }, { status: 404 });

      return NextResponse.json({
        ...conversation,
        messages: conversation.messages.map((m) => ({
          ...m,
          content: getDecryptedContent(m.content),
        })),
      });
    }

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
  } catch {
    return NextResponse.json(
      { error: apiMessages.failedToRetrieveConversations },
      { status: 500 }
    );
  }
}
