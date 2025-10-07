import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import { GoogleGenAI, Content } from '@google/genai'
import prisma from '@/shared/lib/database'
import { RAGService, Persona } from '@/shared/services/rag'
import { User } from '@/shared/types/auth'


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const ragService = new RAGService();

// A more sophisticated logic to transition between agent personas.
// This can be expanded with more complex NLP or keyword analysis.
function determineNextPersona(currentPersona: Persona, conversationHistory: Content[], fullResponse: string): Persona {
    const userMessages = conversationHistory.filter(m => m.role === 'user').length;
    
    // After the first few exchanges, move from intake to a more directive role.
    if (currentPersona === 'intake_specialist' && userMessages > 2) {
        return 'questioner_and_clarifier';
    }

    // If the user starts talking about specific actions, switch to the behavioral coach.
    if (fullResponse.toLowerCase().includes('i should try') || fullResponse.toLowerCase().includes('my goal is')) {
        return 'goal_setting_coach';
    }

    return currentPersona;
}

async function handleStream(
    stream: ReadableStream<Uint8Array>,
    sessionId: string,
    history: Content[],
    userMessage: Content,
    currentPersona: Persona
) {
    const reader = stream.getReader();
    let fullResponse = '';
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
    }
    
    const aiMessage: Content = { role: 'model', parts: [{ text: fullResponse }] };
    const nextPersona = determineNextPersona(currentPersona, [...history, userMessage], fullResponse);

    await prisma.aiSession.update({
        where: { id: sessionId },
        data: {
            messages: {
                // @ts-ignore
                push: [userMessage, aiMessage],
            },
            context: {
                persona: nextPersona,
            },
        },
    });
}


export async function POST(request: NextRequest) {
  try {
    const { messages: clientMessages } = await request.json()
    
    // Try to get token from cookie first, then fall back to Authorization header
    let token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 })
    }

    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }});
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    let session = await prisma.aiSession.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    if (!session) {
        session = await prisma.aiSession.create({
            data: {
                userId: user.id,
                messages: [],
                context: { persona: 'intake_specialist' }
            }
        });
    }
    
    // @ts-ignore
    const currentPersona = (session.context?.persona || 'intake_specialist') as Persona;
    const history = (session.messages || []) as Content[];
    const newMessageContent = clientMessages[clientMessages.length - 1].content;
    const userMessage: Content = { role: 'user', parts: [{ text: newMessageContent }] };

    const { systemInstruction } = await ragService.getContext(user as User, currentPersona);
    
    const contents: Content[] = [...history, userMessage];

    const resultStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction
        }
    });
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of resultStream) {
          const chunkText = chunk.text ?? '';
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    const [stream1, stream2] = readableStream.tee();

    // Persist conversation in the background without blocking the response
    handleStream(stream2, session.id, history, userMessage, currentPersona).catch(console.error);
    
    return new Response(stream1, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
