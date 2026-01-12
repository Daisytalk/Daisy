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
 * Based on Azure ML scoring script output
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
 * Send chat message to AI API
 * 
 * @param text - User message text
 * @param userId - User identifier
 * @param sessionId - Session identifier
 * @param conversationHistory - Previous messages for context
 * @returns AI API response
 */
export async function sendChatMessage(
  text: string,
  userId: string,
  sessionId: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<AIApiResponse> {
  // Azure ML endpoints use the base URL directly (already includes /score)
  const endpoint = API_BASE_URL;

  // Build conversation context with history
  let promptWithHistory = '';
  
  if (conversationHistory && conversationHistory.length > 0) {
    // Take last 5 messages for context (to keep prompt short)
    const recentHistory = conversationHistory.slice(-5);
    
    promptWithHistory = `Previous conversation:\n`;
    recentHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Client' : 'Daisy';
      promptWithHistory += `${role}: ${msg.content}\n`;
    });
    promptWithHistory += `\nClient: ${text}\nDaisy:`;
  } else {
    // First message - add system context
    promptWithHistory = `You are Daisy, a compassionate CBT therapist. A client is reaching out to you.\n\nClient: ${text}\nDaisy:`;
  }

  console.log('📤 Sending to AI API:', {
    url: endpoint,
    userId,
    sessionId,
    messageLength: text.length,
    hasHistory: !!conversationHistory && conversationHistory.length > 0,
    historyLength: conversationHistory?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Azure ML scoring script expects "prompt" field
  const requestBody = {
    prompt: promptWithHistory,
    max_tokens: 200,
    temperature: 0.7,
    top_p: 0.9,
    top_k: 50
  };

  console.log('📦 Request body (prompt preview):', promptWithHistory.substring(0, 200) + '...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes for model inference

    // Azure ML scoring script expects "prompt" field
    // Send user message directly - the model has its own system prompt
    const requestBody = {
      prompt: text,
      max_tokens: 200,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50
    };

    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

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
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 401) {
        throw new Error('Invalid API key - check NEXT_PUBLIC_AI_API_KEY');
      } else if (response.status === 404) {
        throw new Error('AI API endpoint not found - check NEXT_PUBLIC_AI_API_URL');
      } else if (response.status === 500) {
        throw new Error(`AI API server error: ${errorText}`);
      } else {
        throw new Error(`AI API error (${response.status}): ${errorText}`);
      }
    }

    let data: any;
    let rawResponse: string;
    
    try {
      // Get response as JSON
      const jsonData = await response.json();
      
      // Check if it's a string (double-encoded JSON)
      if (typeof jsonData === 'string') {
        console.log('📦 Response is double-encoded JSON string, parsing again...');
        rawResponse = jsonData;
        data = JSON.parse(jsonData);
      } else {
        // Already an object
        data = jsonData;
        rawResponse = JSON.stringify(data);
      }
      
      console.log('📦 Parsed response from Azure ML (first 500 chars):', rawResponse.substring(0, 500));
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      throw new Error(`Failed to parse AI API response: ${error}`);
    }

    console.log('✅ AI API Response:', {
      responseLength: data.response?.length || 0,
      hasError: !!data.error,
      persona: data.persona_used,
      protocol: data.protocol_used,
      diagnosis: data.diagnosis,
      responseType: typeof data.response,
      dataType: typeof data,
      hasResponseField: 'response' in data,
      timestamp: new Date().toISOString()
    });

    if (data.error) {
      throw new Error(`AI API returned error: ${data.error}`);
    }

    if (!data.response || typeof data.response !== 'string') {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid AI API response format: missing or invalid "response" field');
    }

    // Add default values for missing fields (for backward compatibility)
    return {
      response: data.response,
      persona_used: data.persona_used || 'active_listener',
      protocol_used: data.protocol_used || 'cbt',
      diagnosis: data.diagnosis || []
    };

  } catch (error) {
    console.error('❌ AI API Request Failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
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
 * @returns true if AI API is reachable
 */
export async function checkAIApiHealth(): Promise<boolean> {
  try {
    // Azure ML endpoints don't have a /health endpoint, use the scoring endpoint
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY!}`,
        'azureml-model-deployment': 'cbt-model-with-token'
      },
      body: JSON.stringify({
        text: 'health check',
        user_id: 'system',
        session_id: 'health-check'
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
