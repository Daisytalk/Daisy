// CBT Therapy API Client via Azure
interface CBTChatRequest {
  text: string;
  user_id: string;
  persona?: string;
  session_id?: string;
}

interface CBTChatResponse {
  response: string;
  protocol_used?: string;
  diagnosis?: string[];
  persona_used?: string;
  tone?: string;
  protocol?: string;
  status?: string;
}

interface CBTToneRequest {
  user_id: string;
  tone: string;
}

export class CBTApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    console.log('🔍 Environment check:', {
      CBT_API_URL: process.env.CBT_API_URL ? '***set***' : 'NOT SET',
      CBT_API_KEY: process.env.CBT_API_KEY ? '***set***' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    });

    // Use Azure-hosted CBT API URL from environment
    this.apiUrl = process.env.CBT_API_URL || 'https://cbt-therapy-api-daisy-ergpf5fecjeheub5.centralus-01.azurewebsites.net';
    this.apiKey = process.env.CBT_API_KEY || '';

    // Remove trailing slash if present
    this.apiUrl = this.apiUrl.replace(/\/$/, '');

    console.log('✅ CBTApiClient initialized:', {
      apiUrl: this.apiUrl,
      hasApiKey: !!this.apiKey
    });
  }

  async chat(request: CBTChatRequest): Promise<CBTChatResponse> {
    // Prepare payload - API expects "text" not "message"
    const payload = {
      text: request.text,
      user_id: request.user_id,
      session_id: request.session_id,
      persona: request.persona
    };

    console.log('🚀 Sending to Azure CBT API:', {
      url: this.apiUrl,
      hasApiKey: !!this.apiKey,
      payload
    });

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API key if available
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      // Don't add /chat - the base URL is the endpoint
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('📥 Azure CBT API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Azure CBT API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Azure CBT API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Get raw response text first for debugging
      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText.substring(0, 500));

      if (!responseText || responseText.trim() === '' || responseText === 'null') {
        throw new Error('Azure CBT API returned empty or null response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON from Azure CBT API: ${responseText.substring(0, 100)}`);
      }

      console.log('✅ Azure CBT API response data:', data);

      // Check if we got a valid response
      const responseContent = data?.response || data?.body?.response || data?.message;
      if (!responseContent) {
        console.error('❌ No response content found in:', data);
        throw new Error('Azure CBT API returned response without content.');
      }

      // Map response format to expected format
      return {
        response: responseContent,
        protocol_used: data.protocol || data.body?.protocol || 'general_cbt',
        persona_used: data.tone || data.body?.tone || data.persona || 'empathetic',
        diagnosis: data.diagnosis || data.body?.diagnosis || [],
        tone: data.tone || data.body?.tone,
        protocol: data.protocol || data.body?.protocol,
        status: data.status || data.body?.status || 'success',
      };

    } catch (error: any) {
      console.error('❌ Azure CBT API invocation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      if (error.message.includes('fetch failed')) {
        throw new Error(`Unable to reach Azure CBT API. Check if the URL is correct: ${this.apiUrl}`);
      }

      throw error;
    }
  }

  async setTone(request: CBTToneRequest): Promise<void> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(`${this.apiUrl}/tone/set`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to set tone: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Azure CBT API set tone error:', error);
      throw error;
    }
  }

  async getPersonas(): Promise<{ personas: string[]; default: string }> {
    try {
      const headers: HeadersInit = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(`${this.apiUrl}/personas`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch personas');
      }

      return await response.json();
    } catch (error) {
      console.error('Azure CBT API get personas error:', error);
      return {
        personas: ['empathetic', 'professional', 'friendly', 'active_listener'],
        default: 'empathetic',
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const headers: HeadersInit = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(`${this.apiUrl}/health`, {
        headers
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /** Structured dynamics insights — uses model's native analysis endpoint */
  async getDynamicsInsights(request: {
    user_id: string;
    period_days: number;
    checkins: Array<{ date: string; emotion?: number; stress?: number; energy?: number; support?: number }>;
    locale?: string;
  }): Promise<{ emotion: string; stress: string; energy: string; support: string }> {
    const payload = {
      request_type: 'dynamics_insights',
      user_id: request.user_id,
      period_days: request.period_days,
      checkins: request.checkins,
      locale: request.locale || 'ru',
    };
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['x-api-key'] = this.apiKey;
    const res = await fetch(`${this.apiUrl}/chat`, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`CBT API error: ${res.status}`);
    return res.json();
  }

  /** Structured weekly report — uses model's native analysis endpoint */
  async getWeeklyReport(request: {
    user_id: string;
    period_days: number;
    checkins: Array<{ date: string; emotion?: number; stress?: number; energy?: number; support?: number }>;
    profile?: { ESI?: number; BSI?: number; SSI?: number; MRI?: number; riskLevel?: string };
    memory_topics?: string[];
    locale?: string;
  }): Promise<{ summary: string; insights: string[]; recommendations: string[] }> {
    const payload = {
      request_type: 'weekly_report',
      user_id: request.user_id,
      period_days: request.period_days,
      checkins: request.checkins,
      profile: request.profile || {},
      memory_topics: request.memory_topics || [],
      locale: request.locale || 'ru',
    };
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['x-api-key'] = this.apiKey;
    const res = await fetch(`${this.apiUrl}/chat`, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`CBT API error: ${res.status}`);
    return res.json();
  }
}

// Singleton instance
export const cbtApi = new CBTApiClient();