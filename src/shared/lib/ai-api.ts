/**
 * AI API Service - Normalized Response Handler
 * 
 * This service ensures consistent CBT therapy responses from the AI model
 * by using structured prompts and response normalization.
 * 
 * Updated: 2026-02-10 - Fixed environment variables for server-side
 */

import type { DaisyDebugContext } from '@/shared/types/daisy'

/** Read AI API config at request time (not at module load) so runtime env vars are always picked up */
function getApiBaseUrl(): string {
  const url = process.env.AI_API_URL;
  if (!url) {
    throw new Error('AI API configuration missing: set AI_API_URL (server-only)');
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('AI_API_URL must include protocol (http:// or https://)');
  }
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getApiKey(): string {
  const key = process.env.AI_API_KEY;
  if (!key) {
    throw new Error('AI API key missing: set AI_API_KEY (server-only, never NEXT_PUBLIC_)');
  }
  return key;
}

/** Optional Azure ML deployment slot for staged rollouts (e.g. gpu-deployment-ru-translate). */
function getAmlDeploymentName(): string | undefined {
  const name = (process.env.AML_DEPLOYMENT_NAME || '').trim();
  return name || undefined;
}

/** Per-locale deployment override: AML_DEPLOYMENT_NAME_RU, _EN, _KK */
function resolveAmlDeployment(locale?: string): string | undefined {
  const loc = (locale || '').toLowerCase();
  if (loc === 'ru') {
    const ru = (process.env.AML_DEPLOYMENT_NAME_RU || '').trim();
    if (ru) return ru;
  } else if (loc === 'kk') {
    const kk = (process.env.AML_DEPLOYMENT_NAME_KK || '').trim();
    if (kk) return kk;
  } else if (loc === 'en') {
    const en = (process.env.AML_DEPLOYMENT_NAME_EN || '').trim();
    if (en) return en;
  }
  return getAmlDeploymentName();
}

/**
 * CBT System Prompt - Forces therapeutic response format
 */
const CBT_SYSTEM_PROMPT = `You are Daisy, a professional Cognitive Behavioral Therapy (CBT) assistant.

CONTEXT AND MEMORY:
- Always use the conversation history and user_context you are given. Stay on the current topic the user is discussing.
- Do not bring up unrelated past topics or jump to themes from earlier sessions unless the user does.
- Reference what the user just said and what was said earlier in this conversation to keep continuity.

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
/** AI-generated user image (summary, goals, concerns) */
export interface AIProfile {
  summary?: string;
  goals?: string[];
  concerns?: string[];
  communication_style?: string;
  updatedAt?: string;
}

/**
 * Диагностика: что модель получила (has_onboarding, has_memory, daisy_state и т.д.).
 * Canonical shape lives in @/shared/types/daisy — this alias keeps existing imports working.
 */
export type DebugContext = DaisyDebugContext

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
  metrics?: unknown;
  error?: string;
  ai_profile?: AIProfile;
  /** 1–3 short facts from this exchange; save to DB and pass back in user_context */
  memory_update?: string[];
  /** Что модель получила — для диагностики */
  debug_context?: DaisyDebugContext;
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
  
  // No truncation: show full model response (model/API controls length via max_tokens)
  
  // Ensure ends with proper punctuation
  if (!/[.!?]$/.test(normalized)) {
    normalized += '.';
  }

  return normalized;
}

/**
 * Build conversation prompt with history (reserved for future use)
 */
function _buildConversationPrompt(
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
 * Send chat message to Daisy API with normalized response
 *
 * @param options.request_ai_profile - Ask API to generate/update ai_profile in the response
 * @param options.onboarding_summary - OnboardingData.responses + User.aiProfile
 * @param options.user_context - User.conversationMemory (накопленные факты)
 * @param options.persona - CbtConversation.persona
 * @param options.locale - "ru" | "kk" | "en"
 * @param options.psych_profile - ESI, BSI, SSI, PVI, MRI, riskLevel, cluster для персонализации
 */
export async function sendChatMessage(
  text: string,
  userId: string,
  sessionId: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  options?: {
    request_ai_profile?: boolean;
    onboarding_summary?: unknown;
    user_context?: string;
    persona?: string;
    locale?: string;
    psych_profile?: {
      ESI: number;
      BSI: number;
      SSI: number;
      PVI: number;
      MRI: number;
      riskLevel: string;
      cluster?: string;
      flags?: Record<string, boolean>;
    };
    protocol_directive?: string;
    state?: string;
  }
): Promise<AIApiResponse> {
  const endpoint = getApiBaseUrl();

  const requestBody: Record<string, unknown> = {
    message: text,
    user_id: userId || 'web_user',
    conversation_id: sessionId,
    history: conversationHistory || []
  };
  if (options?.state != null && options.state !== '') {
    requestBody.state = options.state;
  }
  if (options?.request_ai_profile === true) {
    requestBody.request_ai_profile = true;
  }
  if (options?.onboarding_summary != null) {
    requestBody.onboarding_summary = options.onboarding_summary;
  }
  if (options?.user_context != null && options.user_context !== '') {
    requestBody.user_context = options.user_context;
  }
  if (options?.persona != null && options.persona !== '') {
    requestBody.persona = options.persona;
  }
  if (options?.locale != null && options.locale !== '') {
    requestBody.locale = options.locale;
  }
  if (options?.psych_profile != null) {
    requestBody.psych_profile = options.psych_profile;
  }
  if (options?.protocol_directive != null && options.protocol_directive !== '') {
    requestBody.protocol_directive = options.protocol_directive;
  }

  const historyArr = (requestBody.history as Array<{ role: string; content: string }>) || []
  console.log('📤 Sending to Azure ML AI API:', {
    url: endpoint,
    userId,
    sessionId,
    messageLength: text.length,
    historyLength: historyArr.length,
    request_ai_profile: requestBody.request_ai_profile,
    timestamp: new Date().toISOString()
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    console.log('📞 Calling Azure ML fetch now...', { endpoint: endpoint.substring(0, 60) + '...' });
    const deployment = resolveAmlDeployment(options?.locale);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`
    };
    if (deployment) {
      headers['azureml-model-deployment'] = deployment;
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
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

    // Azure ML can return: JSON object, JSON string (including BOM), or array with one item
    let data: Record<string, unknown> | undefined;
    try {
      const raw = await response.text();
      const trimmed = raw.trim();
      const toParse = trimmed.startsWith('\uFEFF') ? trimmed.slice(1) : trimmed; // strip BOM
      let parsed: unknown;
      try {
        parsed = JSON.parse(toParse);
      } catch {
        throw new Error('Response body is not valid JSON');
      }
      // Unwrap array of one element (Azure sometimes returns [{ ... }])
      if (Array.isArray(parsed) && parsed.length > 0) parsed = parsed[0];
      // If still a string (e.g. double-encoded JSON), parse again
      while (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          data = { response: parsed };
          break;
        }
      }
      if (data === undefined && parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        data = parsed as Record<string, unknown>;
      }
      if (data === undefined) {
        data = { response: typeof raw === 'string' ? raw.trim() : String(raw) };
      }
      // If data ended up as a string (e.g. from older code paths or BOM), parse it
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data) as Record<string, unknown>;
        } catch {
          data = { response: data };
        }
      }
      if (!data || typeof data !== 'object') {
        data = { response: String(raw || '').trim() };
      }
      const dataObj = data as Record<string, unknown>;
      console.log('📦 Azure ML response keys:', Object.keys(dataObj).filter((k: string) => !/^\d+$/.test(k)).slice(0, 10));
    } catch (error) {
      console.error('❌ Failed to parse Azure ML response:', error);
      throw new Error(`Failed to parse AI API response: ${error}`);
    }

    const dataObj = data as Record<string, unknown>;
    if (dataObj?.error) {
      throw new Error(`AI API returned error: ${dataObj.error}`);
    }

    let responseText: unknown = dataObj?.response;
    if (responseText != null && typeof responseText !== 'string') responseText = String(responseText);
    if (responseText == null || responseText === '') {
      console.error('❌ Invalid Azure ML response format:', dataObj);
      throw new Error('Invalid AI API response format: missing "response" field');
    }
    const responseStr = String(responseText);

    const normalizedResponse = normalizeTherapyResponse(responseStr);

    console.log('✅ Azure ML response normalized:', {
      originalLength: responseStr.length,
      normalizedLength: normalizedResponse.length
    });

    const aiProfile = dataObj?.ai_profile && typeof dataObj.ai_profile === 'object' ? dataObj.ai_profile as AIProfile : undefined;
    const memoryUpdate = Array.isArray(dataObj?.memory_update)
      ? (dataObj.memory_update as unknown[]).filter((x): x is string => typeof x === 'string')
      : undefined;
    const debugContext = dataObj?.debug_context && typeof dataObj.debug_context === 'object'
      ? (dataObj.debug_context as DebugContext)
      : undefined;

    return {
      response: normalizedResponse,
      persona_used: (dataObj.persona_used as string | undefined) ?? 'active_listener',
      protocol_used: (dataObj.protocol_used as string | undefined) ?? 'cbt',
      diagnosis: Array.isArray(dataObj.diagnosis) ? dataObj.diagnosis as string[] : [],
      prompt: text,
      parameters: {
        max_tokens: typeof dataObj.max_tokens === 'number' ? dataObj.max_tokens : 0,
        temperature: typeof dataObj.temperature === 'number' ? dataObj.temperature : 0,
        top_p: 0.9
      },
      metrics: dataObj.metrics,
      ai_profile: aiProfile,
      memory_update: memoryUpdate,
      debug_context: debugContext
    };

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('❌ AI API Request Failed:', {
      errorMessage: err.message,
      errorName: err.name,
      stack: err.stack,
      endpoint,
      userId,
      sessionId,
      timestamp: new Date().toISOString()
    });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${String(error)}`);
  }
}

/**
 * Health check for AI API
 */
export async function checkAIApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(getApiBaseUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`
      },
      body: JSON.stringify({
        message: 'health check',
        user_id: 'health_check',
        max_tokens: 10,
        temperature: 0.1,
        history: []
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
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  return {
    url: url ?? '(not set)',
    hasApiKey: !!key,
  };
}
