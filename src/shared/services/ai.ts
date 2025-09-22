import { env } from '@/shared/config/env'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIContext {
  userId: string
  onboardingData?: Record<string, any>
  sessionHistory?: AIMessage[]
  preferences?: Record<string, any>
}

export interface IAIService {
  generateResponse(messages: AIMessage[], context?: AIContext): Promise<AIResponse>
  generatePersonalizedRecommendations(context: AIContext): Promise<string[]>
  analyzeMentalHealthNeeds(userInput: string, context?: AIContext): Promise<{
    concerns: string[]
    recommendations: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'crisis'
  }>
}

export class GeminiAIService implements IAIService {
  private apiKey: string
  private projectId: string
  private location: string

  constructor() {
    this.apiKey = env.GEMINI_API_KEY
    this.projectId = env.GOOGLE_CLOUD_PROJECT_ID
    this.location = env.GOOGLE_CLOUD_LOCATION
  }

  async generateResponse(messages: AIMessage[], context?: AIContext): Promise<AIResponse> {
    try {
      // Prepare the prompt with context
      const systemPrompt = this.buildSystemPrompt(context)
      const conversationHistory = messages.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n')

      const prompt = `${systemPrompt}\n\nConversation:\n${conversationHistory}\n\nassistant:`

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I cannot generate a response at this time.'

      return {
        content,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        }
      }
    } catch (error) {
      console.error('Gemini AI Service Error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  async generatePersonalizedRecommendations(context: AIContext): Promise<string[]> {
    const prompt = `Based on the user's onboarding data and preferences, generate 5 personalized mental health recommendations:

User Context:
- Onboarding Data: ${JSON.stringify(context.onboardingData || {})}
- Preferences: ${JSON.stringify(context.preferences || {})}

Please provide specific, actionable recommendations that would be helpful for this user's mental health journey.`

    const response = await this.generateResponse([
      { role: 'system', content: 'You are a mental health AI assistant providing personalized recommendations.' },
      { role: 'user', content: prompt }
    ], context)

    // Parse recommendations from response
    const recommendations = response.content
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[-\d.]\s*/, '').trim())
      .filter(rec => rec.length > 0)

    return recommendations.slice(0, 5)
  }

  async analyzeMentalHealthNeeds(userInput: string, context?: AIContext): Promise<{
    concerns: string[]
    recommendations: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'crisis'
  }> {
    const prompt = `Analyze the following user input for mental health concerns and provide recommendations:

User Input: "${userInput}"

Context: ${context ? JSON.stringify(context.onboardingData) : 'No additional context'}

Please provide:
1. Identified concerns (list)
2. Recommendations (list)
3. Urgency level (low/medium/high/crisis)

Format your response as JSON.`

    const response = await this.generateResponse([
      { role: 'system', content: 'You are a mental health AI assistant. Analyze user input and provide structured feedback.' },
      { role: 'user', content: prompt }
    ], context)

    try {
      // Try to parse JSON response
      const analysis = JSON.parse(response.content)
      return {
        concerns: analysis.concerns || [],
        recommendations: analysis.recommendations || [],
        urgencyLevel: analysis.urgencyLevel || 'low'
      }
    } catch {
      // Fallback if JSON parsing fails
      return {
        concerns: ['General mental health support needed'],
        recommendations: ['Consider speaking with a licensed therapist'],
        urgencyLevel: 'medium'
      }
    }
  }

  private buildSystemPrompt(context?: AIContext): string {
    let prompt = `You are Daisy, a compassionate AI mental health assistant. You provide supportive, empathetic responses while always encouraging users to seek professional help when needed.

Guidelines:
- Be warm, understanding, and non-judgmental
- Provide helpful mental health information and coping strategies
- Always recommend professional help for serious concerns
- Never provide medical diagnoses or replace professional therapy
- Be mindful of crisis situations and provide appropriate resources
- Respect user privacy and confidentiality`

    if (context?.onboardingData) {
      prompt += `\n\nUser Context:
- Onboarding responses: ${JSON.stringify(context.onboardingData)}
- User preferences: ${JSON.stringify(context.preferences || {})}`
    }

    return prompt
  }
}

// Vertex AI Service for post-trained models
export class VertexAIService implements IAIService {
  private projectId: string
  private location: string
  private endpoint: string

  constructor() {
    this.projectId = env.GOOGLE_CLOUD_PROJECT_ID
    this.location = env.GOOGLE_CLOUD_LOCATION
    this.endpoint = env.VERTEX_AI_ENDPOINT
  }

  async generateResponse(messages: AIMessage[], context?: AIContext): Promise<AIResponse> {
    try {
      // This would use your custom trained model on Vertex AI
      const response = await fetch(`${this.endpoint}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAccessToken()}`
        },
        body: JSON.stringify({
          instances: [{
            messages,
            context
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Vertex AI error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        content: data.predictions?.[0]?.content || 'Unable to generate response',
        usage: data.predictions?.[0]?.usage
      }
    } catch (error) {
      console.error('Vertex AI Service Error:', error)
      // Fallback to Gemini if Vertex AI fails
      const geminiService = new GeminiAIService()
      return geminiService.generateResponse(messages, context)
    }
  }

  async generatePersonalizedRecommendations(context: AIContext): Promise<string[]> {
    // Implementation similar to Gemini but using custom trained model
    const geminiService = new GeminiAIService()
    return geminiService.generatePersonalizedRecommendations(context)
  }

  async analyzeMentalHealthNeeds(userInput: string, context?: AIContext): Promise<{
    concerns: string[]
    recommendations: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'crisis'
  }> {
    // Implementation similar to Gemini but using custom trained model
    const geminiService = new GeminiAIService()
    return geminiService.analyzeMentalHealthNeeds(userInput, context)
  }

  private async getAccessToken(): Promise<string> {
    // In production, this would use Google Cloud authentication
    // For now, return empty string as placeholder
    return ''
  }
}