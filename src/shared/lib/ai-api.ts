/**
 * AI API Service - Normalized Response Handler
 * 
 * This service ensures consistent CBT therapy responses from the AI model
 * by using structured prompts and response normalization
 */

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL;
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;

// Validate configuration on module load
if (!AI_API_URL || !AI_API_KEY) {
  console.error('❌ CRITICAL: AI API configuration missing!');
  throw new Error('AI API configuration missing in environment variables');
}

if (!AI_API_URL.startsWith('http://') && !AI_API_URL.startsWith('https://')) {
  throw new Error('AI_API_URL must include protocol (http:// or https://)');
}

const API_BASE_URL = AI_API_URL.endsWith('/') ? AI_API_URL.slice(0, -1) : AI_API_URL;

console.log('✅ AI API configured:', {
  url: API_BASE_URL,
  hasApiKey: !!AI_API_KEY,
  apiKeyLength: AI_API_KEY.length
});

/**
 * CBT System Prompt - Forces therapeutic response format
 */
const CBT_SYSTEM_PROMPT = `You are Daisy, a professional Cognitive Behavioral Therapy (CBT) assistant.

RESPONSE RULES:
1. Keep responses under 150 words
2. Ask ONE focused question at a time
3. Use Socratic questioning to explore thoughts
4. Identify cognitive distortions when present
5. Be empathetic but direct
6. Never give medical diagnoses
7. Suggest behavioral experiments or homework when appropriate

CBT TECHNIQUES TO USE:
- Thought challenging: "What evidence supports/contradicts that thought?"
- Behavioral activation: "What small activity could you try this week?"
- Cognitive restructuring: "How might you reframe that thought?"
- Exposure planning: "What would it look like to face that gradually?"

NEVER:
- Write essays or explanations
- Start with "Dear [User]" or letter format
- Give generic advice without exploring specifics
- Make assumptions about the user's situation

Respond naturally as if in a therapy session.`;

/**
 * AI API Response Interface
 */
export interface AIApiResponse {
  response: string;
  persona_used?: string;
  protocol_used?: string;
  diagnosis?: string[];
  prompt?: string;
  parameters?: {
    max_tokens: number;
    temperature: number;
    top_p: number;
  };
  metrics?: any;
  error?: string;
}

/**
 * Normalize AI response to proper therapeutic format
 */
function normalizeTherapyResponse(rawResponse: string): string {
  let normalized = rawResponse.trim();

  // Remove letter-style greetings
  normalized = normalized.replace(/^Dear\s+\[?User\]?,?\s*/gi, '');
  normalized = normalized.replace(/^Dear\s+\w+,?\s*/gi, '');
  
  // Remove sign-offs
  normalized = normalized.replace(/\n*Best,?\s*\[?\w+\]?\s*$/gi, '');
  normalized = normalized.replace(/\n*Sincerely,?\s*\[?\w+\]?\s*$/gi, '');
  normalized = normalized.replace(/\n*Warm regards,?\s*\[?\w+\]?\s*$/gi, '');
  
  // Remove "Response:" prefix
  normalized = normalized.replace(/^Response:\s*/i, '');
  
  // Remove excessive newlines
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  // Limit to 150 words (therapeutic best practice)
  const words = normalized.split(/\s+/);
  if (words.length > 150) {
    normalized = words.slice(0, 150).join(' ') + '...';
  }
  
  // Ensure ends with proper punctuation
  if (!/[.!?]$/.test(normalized)) {
    normalized += '.';
  }

  return normalized;
}

/**
 * Build conversation prompt with history
 */
function buildConversationPrompt(
  currentMessage: string,
  conversationHistory?: Array<{ role: string; content: string }>
): string {
  let prompt = CBT_SYSTEM_PROMPT + '\n\n';

  if (conversationHistory && conversationHistory.length > 0) {
    // Include last 5 exchanges for context
    const recentHistory = conversationHistory.slice(-10); // Last 5 user + 5 assistant
    
    prompt += 'CONVERSATION HISTORY:\n';
    recentHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Client' : 'Therapist';
      prompt += `${role}: ${msg.content}\n`;
    });
    prompt += '\n';
  }

  prompt += `Client: ${currentMessage}\n\nTherapist:`;
  
  return prompt;
}

/**
 * Send chat message to AI API with normalized response
 * 
 * @param text - User message text
 * @param userId - User identifier
 * @param sessionId - Session identifier
 * @param conversationHistory - Previous messages for context
 * @returns AI API response with normalized therapy format
 */
export async function sendChatMessage(
  text: string,
  userId: string,
  sessionId: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<AIApiResponse> {
  const endpoint = API_BASE_URL;

  // Build structured prompt with system instructions
  const structuredPrompt = buildConversationPrompt(text, conversationHistory);

  console.log('📤 Sending to AI API:', {
    url: endpoint,
    userId,
    sessionId,
    messageLength: text.length,
    hasHistory: !!conversationHistory && conversationHistory.length > 0,
    historyLength: conversationHistory?.length || 0,
    promptLength: structuredPrompt.length,
    timestamp: new Date().toISOString()
  });

  const requestBody = {
    prompt: structuredPrompt,
    max_tokens: 200,
    temperature: 0.4,  // Lower for more consistent therapeutic responses
    top_p: 0.9,
    top_k: 40
  };

  console.log('📦 Request preview (first 300 chars):', 
    structuredPrompt.substring(0, 300) + '...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY!}`,
        'azureml-model-deployment': 'cbt-model-with-token'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📥 AI API Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API Error:', {
        status: response.status,
        body: errorText
      });

      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        throw new Error('AI API endpoint not found');
      } else {
        throw new Error(`AI API error (${response.status}): ${errorText}`);
      }
    }

    let data: any;
    try {
      const jsonData = await response.json();
      
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }
      
      console.log('📦 Raw response length:', data.response?.length || 0);
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      throw new Error(`Failed to parse AI API response: ${error}`);
    }

    if (data.error) {
      throw new Error(`AI API returned error: ${data.error}`);
    }

    if (!data.response || typeof data.response !== 'string') {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid AI API response format: missing "response" field');
    }

    // ✨ NORMALIZE THE RESPONSE
    const normalizedResponse = normalizeTherapyResponse(data.response);

    console.log('✅ Response normalized:', {
      originalLength: data.response.length,
      normalizedLength: normalizedResponse.length,
      preview: normalizedResponse.substring(0, 100) + '...'
    });

    return {
      response: normalizedResponse,  // ← Return cleaned response
      persona_used: data.persona_used || 'active_listener',
      protocol_used: data.protocol_used || 'cbt',
      diagnosis: data.diagnosis || [],
      prompt: text,
      parameters: {
        max_tokens: requestBody.max_tokens,
        temperature: requestBody.temperature,
        top_p: requestBody.top_p
      },
      metrics: data.metrics
    };

  } catch (error) {
    console.error('❌ AI API Request Failed:', {
      error: error instanceof Error ? error.message : String(error),
      endpoint,
      userId,
      sessionId,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Network error: ${String(error)}`);
    }
  }
}

/**
 * Health check for AI API
 */
export async function checkAIApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY!}`,
        'azureml-model-deployment': 'cbt-model-with-token'
      },
      body: JSON.stringify({
        prompt: 'health check',
        max_tokens: 10,
        temperature: 0.1
      })
    });
    return response.ok || response.status === 200;
  } catch (error) {
    console.error('AI API health check failed:', error);
    return false;
  }
}

/**
 * Get AI API configuration (for debugging)
 */
export function getAIApiConfig() {
  return {
    url: API_BASE_URL,
    hasApiKey: !!AI_API_KEY,
    apiKeyLength: AI_API_KEY?.length || 0
  };
}
