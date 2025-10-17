// CBT Therapy API Client
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
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.CBT_API_URL || 'http://localhost:8000';
    this.apiKey = process.env.CBT_API_KEY || '';

    if (!this.apiKey) {
      console.warn('CBT_API_KEY not set in environment variables');
    }
  }

  async chat(request: CBTChatRequest): Promise<CBTChatResponse> {
    try {
      // SageMaker API expects "message" field, not "text"
      const payload = {
        message: request.text,
        user_id: request.user_id,
        session_id: request.session_id,
      };

      console.log('Sending to SageMaker:', { url: this.baseUrl, payload });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SageMaker API error:', { status: response.status, body: errorText });
        throw new Error(`CBT API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('SageMaker response:', data);

      // Map SageMaker response format to expected format
      return {
        response: data.response,
        protocol_used: data.protocol || 'general_cbt',
        persona_used: data.tone || 'empathetic',
        diagnosis: [],
        tone: data.tone,
        protocol: data.protocol,
        status: data.status,
      };
    } catch (error) {
      console.error('CBT API chat error:', error);
      throw new Error('Failed to get therapy response');
    }
  }

  async setTone(request: CBTToneRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tone/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to set tone: ${response.statusText}`);
      }
    } catch (error) {
      console.error('CBT API set tone error:', error);
      throw error;
    }
  }

  async getPersonas(): Promise<{ personas: string[]; default: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/personas`);
      return await response.json();
    } catch (error) {
      console.error('CBT API get personas error:', error);
      return {
        personas: ['active_listener'],
        default: 'active_listener',
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const cbtApi = new CBTApiClient();
