/**
 * AI API Service
 * 
 * CRITICAL: This service sends requests directly to the AI API endpoint.
 * The AI API handles ALL intelligence - persona selection, protocol selection, etc.
 * 
 * Web app ONLY sends: text, user_id, session_id
 * Web app MUST NOT send: persona, onboarding_data, history, protocol
 */

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL;
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;

// Validate configuration on module load
if (!AI_API_URL || !AI_API_KEY) {
  console.error('❌ CRITICAL: AI API configuration missing!');
  console.error('Required environment variables:');
  console.error('  - NEXT_PUBLIC_AI_API_URL');
  console.error('  - NEXT_PUBLIC_AI_API_KEY');
  throw new Error('AI API configuration missing in environment variables');
}

// Validate URL format
if (!AI_API_URL.startsWith('http://') && !AI_API_URL.startsWith('https://')) {
  throw new Error('AI_API_URL must include protocol (http:// or https://)');
}

// Remove trailing slash if present
const API_BASE_URL = AI_API_URL.endsWith('/') ? AI_API_URL.slice(0, -1) : AI_API_URL;

console.log('✅ AI API configured:', {
  url: API_BASE_URL,
  hasApiKey: !!AI_API_KEY,
  apiKeyLength: AI_API_KEY.length
});

/**
 * AI API Response Interface
 */
export interface AIApiResponse {
  response: string;
  persona_used: string;
  protocol_used: string;
  diagnosis: string[];
}

/**
 * Send chat message to AI API
 * 
 * CRITICAL RULES:
 * ✅ MUST send: text, user_id, session_id
 * ❌ MUST NOT send: persona, onboarding_data, history, protocol
 * ✅ MUST include X-API-Key header
 * 
 * @param text - User message text
 * @param userId - User identifier
 * @param sessionId - Session identifier
 * @returns AI API response
 */
export async function sendChatMessage(
  text: string,
  userId: string,
  sessionId: string
): Promise<AIApiResponse> {
  const endpoint = `${API_BASE_URL}/chat`;

  // Log request details (for debugging)
  console.log('📤 Sending to AI API:', {
    url: endpoint,
    userId,
    sessionId,
    messageLength: text.length,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AI_API_KEY!
      },
      body: JSON.stringify({
        text,
        user_id: userId,
        session_id: sessionId
        // CRITICAL: Do NOT send persona, onboarding_data, history, or protocol
        // The AI API handles these automatically
      })
    });

    // Log response status
    console.log('📥 AI API Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      // Provide specific error messages
      if (response.status === 401) {
        throw new Error('Invalid API key - check NEXT_PUBLIC_AI_API_KEY');
      } else if (response.status === 404) {
        throw new Error('AI API endpoint not found - check NEXT_PUBLIC_AI_API_URL');
      } else if (response.status === 500) {
        throw new Error('AI API server error - check AI API logs');
      } else {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }
    }

    // Parse response
    const data: AIApiResponse = await response.json();

    // Log successful response
    console.log('✅ AI API Response:', {
      responseLength: data.response.length,
      persona: data.persona_used,
      protocol: data.protocol_used,
      diagnosis: data.diagnosis,
      timestamp: new Date().toISOString()
    });

    // Validate response format
    if (!data.response || typeof data.response !== 'string') {
      throw new Error('Invalid AI API response format: missing or invalid "response" field');
    }

    return data;

  } catch (error) {
    // Enhanced error logging
    console.error('❌ AI API Request Failed:', {
      error: error instanceof Error ? error.message : String(error),
      endpoint,
      userId,
      sessionId
    });

    // Re-throw with context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Network error: ${String(error)}`);
    }
  }
}

/**
 * Health check for AI API
 * @returns true if AI API is reachable
 */
export async function checkAIApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'X-API-Key': AI_API_KEY!
      }
    });
    return response.ok;
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
