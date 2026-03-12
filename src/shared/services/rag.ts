import { OnboardingApiService } from './onboarding'
import type { OnboardingData, OnboardingAnswer, OnboardingAnswerValue, User } from '@/shared/types/auth'
import { CBT_KNOWLEDGE_BASE } from './cbt-knowledge-base'

export type Persona =
  | 'intake_specialist'
  | 'active_listener'
  | 'emotional_containment_provider'
  | 'questioner_and_clarifier'
  | 'behavioral_coach'
  | 'reflective_mirror'
  | 'challenger_of_beliefs'
  | 'psychoeducator'
  | 'witness'
  | 'motivator'
  | 'boundary_setter'
  | 'cultural_translator'
  | 'goal_setting_coach'
  | 'self_reflective_human';

export class RAGService {
  private readonly onboardingService: OnboardingApiService

  constructor() {
    this.onboardingService = new OnboardingApiService()
  }

  public async getContext(user: User, persona: Persona): Promise<{ systemInstruction: string }> {
    const userContext = await this.getUserContext(user.id);
    const personaContext = this.getPersonaContext(persona);
    const firstContactProtocol = persona === 'intake_specialist' ? CBT_KNOWLEDGE_BASE.first_contact : '';

    const systemInstruction = `You are Daisy, a compassionate and supportive AI mental health assistant based on Cognitive Behavioral Therapy (CBT) principles. Your goal is to provide a safe, non-judgmental space for users to express their feelings and concerns.
- You are not a licensed therapist and cannot provide diagnoses or medical advice.
- Use a warm, empathetic, and encouraging tone.
- Keep responses concise and easy to understand.
- Ask open-ended questions to encourage reflection.
- The user's name is ${user.name}. Use it to personalize the conversation occasionally.

CURRENT ROLE:
${personaContext}

USER CONTEXT:
${userContext}

${firstContactProtocol}
`;
    return { systemInstruction };
  }

  public getPersonaContext(persona: Persona): string {
    return CBT_KNOWLEDGE_BASE.personas[persona] || "You are a general-purpose helpful assistant.";
  }

  private parseResponsesToAnswers(responses: unknown): OnboardingAnswer[] {
    if (!responses) return []
    if (Array.isArray(responses)) {
      return responses as OnboardingAnswer[]
    }
    if (typeof responses === 'object' && !Array.isArray(responses)) {
      const obj = responses as Record<string, unknown>
      if (Array.isArray(obj.answers)) {
        return obj.answers as OnboardingAnswer[]
      }
      return Object.entries(obj).map(([questionId, answer]) => ({
        questionId,
        answer: answer as OnboardingAnswerValue
      }))
    }
    return []
  }

  public async getUserContext(userId: string): Promise<string> {
    try {
      // Server-side: fetch directly from database instead of using API service
      if (typeof window === 'undefined') {
        const prisma = (await import('@/shared/lib/database')).default
        const onboardingData = await prisma.onboardingData.findUnique({
          where: { userId }
        })
        
        if (!onboardingData || !onboardingData.completed) {
          return 'No specific concerns mentioned during onboarding.'
        }
        
        // Convert Prisma responses (JSON) to OnboardingData format
        const answers = this.parseResponsesToAnswers(onboardingData.responses)
        const formattedData: OnboardingData = {
          userId: onboardingData.userId,
          answers,
          completedAt: onboardingData.updatedAt
        }
        
        return this.formatOnboardingDataForContext(formattedData)
      }
      
      // Client-side: use API service
      const data = await this.onboardingService.getOnboardingData(userId)
      if (!data) {
        return 'No specific concerns mentioned during onboarding.'
      }
      return this.formatOnboardingDataForContext(data)
    } catch (error) {
      console.error('Failed to get RAG context:', error)
      return 'Could not retrieve user onboarding information.'
    }
  }

  public formatOnboardingDataForContext(data: OnboardingData): string {
    const summary: string[] = []

    const questionMap: Record<string, string> = {
      'financial-status': 'Financial Status',
      'professional-life': 'Professional Life',
      'romantic-relationships': 'Romantic Relationships',
      'family-relationships': 'Family Relationships',
      'social-relationships': 'Social Relationships',
      'autonomy': 'Autonomy',
      'physical-health-rating': 'Physical Health',
      'emotional-wellbeing': 'Emotional Wellbeing',
      'leisure-hobbies': 'Leisure & Hobbies',
      'living-conditions': 'Living Conditions',
    };

    data.answers.forEach(answer => {
      const questionText = questionMap[answer.questionId]
      if (questionText) {
        if (typeof answer.answer === 'object' && answer.answer && 'rating' in answer.answer) {
          const scaleAnswer = answer.answer as { rating: number; comment: string };
          summary.push(`${questionText} rating: ${scaleAnswer.rating}/5. Comment: "${scaleAnswer.comment}".`);
        }
      }
    })

    if (summary.length === 0) {
      return 'User completed onboarding but did not specify key concerns.'
    }

    return `Based on the user's onboarding, here are their key details: ${summary.join(' ')}`;
  }
}
