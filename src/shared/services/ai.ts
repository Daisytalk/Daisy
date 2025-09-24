// FIX: Replaced placeholder content with a full implementation for the AI service using @google/genai.
import { GoogleGenAI, Content } from '@google/genai'
import { RAGService } from './rag'
import { env } from '@/shared/config/env'
import type { User } from '@/shared/types/auth'

export class AIService {
  private readonly genAI: GoogleGenAI
  private readonly ragService: RAGService
  private readonly model = 'gemini-2.5-pro'

  constructor() {
    if (!env.API_KEY) {
      throw new Error('API_KEY is not set for GeminiAIService')
    }
    this.genAI = new GoogleGenAI({ apiKey: env.API_KEY })
    this.ragService = new RAGService()
  }

  async generateResponseStream(
    history: Content[],
    newMessage: string,
    user: User,
  ): Promise<ReadableStream> {
    const userContext = await this.ragService.getUserContext(user.id)

    const systemInstruction = `You are Daisy, a compassionate and supportive AI mental health companion. Your goal is to provide a safe, non-judgmental space for users to express their feelings and concerns.
- You are not a licensed therapist and cannot provide diagnoses or medical advice. Always gently remind users of this limitation if they ask for one, and suggest they consult a professional.
- Use a warm, empathetic, and encouraging tone.
- Keep responses concise and easy to understand.
- Ask open-ended questions to encourage reflection.
- Here is some context about the user based on their onboarding: ${userContext}
- The user's name is ${user.name}. Use it to personalize the conversation occasionally.`
    
    const contents: Content[] = [
        ...history,
        { role: 'user', parts: [{ text: newMessage }] },
    ];

    const resultStream = await this.genAI.models.generateContentStream({
        model: this.model,
        contents,
        config: {
            systemInstruction
        }
    });
    
    // Convert Gemini stream to a ReadableStream that Vercel AI SDK can understand.
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of resultStream) {
          // The chunk type is GenerateContentResponse. chunk.text can be undefined.
          const chunkText = chunk.text ?? '';
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return stream;
  }
}