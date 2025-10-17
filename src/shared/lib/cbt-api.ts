// CBT Therapy API Client via API Gateway
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
  private apiGatewayUrl: string;
  private apiKey: string;

  constructor() {
    console.log('🔍 Environment check:', {
      CBT_API_URL: process.env.CBT_API_URL ? '***set***' : 'NOT SET',
      CBT_API_KEY: process.env.CBT_API_KEY ? '***set***' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    });

    // Use API Gateway URL instead of localhost
    this.apiGatewayUrl = process.env.CBT_API_URL || process.env.NEXT_PUBLIC_CBT_API_URL || '';
    this.apiKey = process.env.CBT_API_KEY || process.env.NEXT_PUBLIC_CBT_API_KEY || '';

    if (!this.apiGatewayUrl) {
      throw new Error('⚠️ CBT_API_URL not set in environment variables');
    }

    // Remove trailing slash if present
    this.apiGatewayUrl = this.apiGatewayUrl.replace(/\/$/, '');

    console.log('✅ CBTApiClient initialized:', {
      apiGatewayUrl: this.apiGatewayUrl,
      hasApiKey: !!this.apiKey
    });
  }

  async chat(request: CBTChatRequest): Promise<CBTChatResponse> {
    // Prepare payload for your API Gateway/SageMaker
    const payload = {
      message: request.text,
      user_id: request.user_id,
      session_id: request.session_id,
      persona: request.persona
    };

    console.log('🚀 Sending to API Gateway:', {
      url: this.apiGatewayUrl,
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

      const response = await fetch(this.apiGatewayUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('📥 API Gateway response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Gateway error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Gateway error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Gateway response data:', data);

      // Map response format to expected format
      // Adjust this based on your actual API Gateway response structure
      return {
        response: data.response || data.body?.response || data.message || '',
        protocol_used: data.protocol || data.body?.protocol || 'general_cbt',
        persona_used: data.tone || data.body?.tone || data.persona || 'empathetic',
        diagnosis: data.diagnosis || data.body?.diagnosis || [],
        tone: data.tone || data.body?.tone,
        protocol: data.protocol || data.body?.protocol,
        status: data.status || data.body?.status || 'success',
      };

    } catch (error: any) {
      console.error('❌ API Gateway invocation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('fetch failed')) {
        throw new Error(`Unable to reach API Gateway. Check if the URL is correct: ${this.apiGatewayUrl}`);
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

      const response = await fetch(`${this.apiGatewayUrl}/tone/set`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to set tone: ${response.statusText}`);
      }
    } catch (error) {
      console.error('API Gateway set tone error:', error);
      throw error;
    }
  }

  async getPersonas(): Promise<{ personas: string[]; default: string }> {
    try {
      const headers: HeadersInit = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(`${this.apiGatewayUrl}/personas`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch personas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Gateway get personas error:', error);
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

      const response = await fetch(`${this.apiGatewayUrl}/health`, {
        headers
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const cbtApi = new CBTApiClient();