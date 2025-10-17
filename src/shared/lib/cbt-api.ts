// CBT Therapy API Client for SageMaker
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";

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
  private sagemakerClient: SageMakerRuntimeClient;
  private endpointName: string;
  private region: string;

  constructor() {
    console.log('🔍 Environment check:', {
      SAGEMAKER_ENDPOINT_NAME: process.env.SAGEMAKER_ENDPOINT_NAME ? '***set***' : 'NOT SET',
      AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      NODE_ENV: process.env.NODE_ENV,
    });

    this.region = process.env.AWS_REGION || 'us-east-1';
    this.endpointName = process.env.SAGEMAKER_ENDPOINT_NAME || '';

    if (!this.endpointName) {
      throw new Error('⚠️ SAGEMAKER_ENDPOINT_NAME not set in environment variables');
    }

    // Initialize SageMaker Runtime Client
    this.sagemakerClient = new SageMakerRuntimeClient({ 
      region: this.region 
    });

    console.log('✅ CBTApiClient initialized:', {
      endpointName: this.endpointName,
      region: this.region
    });
  }

  async chat(request: CBTChatRequest): Promise<CBTChatResponse> {
    // Prepare payload for SageMaker
    const payload = {
      message: request.text,
      user_id: request.user_id,
      session_id: request.session_id,
      persona: request.persona
    };

    console.log('🚀 Invoking SageMaker endpoint:', {
      endpointName: this.endpointName,
      payload
    });

    try {
      const command = new InvokeEndpointCommand({
        EndpointName: this.endpointName,
        ContentType: 'application/json',
        Body: JSON.stringify(payload),
        Accept: 'application/json'
      });

      const response = await this.sagemakerClient.send(command);
      
      console.log('📥 SageMaker response received:', {
        statusCode: response.$metadata.httpStatusCode
      });

      // Decode the response body
      const resultString = new TextDecoder().decode(response.Body);
      const data = JSON.parse(resultString);

      console.log('✅ SageMaker response data:', data);

      // Map SageMaker response format to expected format
      return {
        response: data.response || data.message || '',
        protocol_used: data.protocol || 'general_cbt',
        persona_used: data.tone || data.persona || 'empathetic',
        diagnosis: data.diagnosis || [],
        tone: data.tone,
        protocol: data.protocol,
        status: data.status || 'success',
      };

    } catch (error: any) {
      console.error('❌ SageMaker invocation error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode
      });
      
      // Provide more specific error messages
      if (error.name === 'ValidationException') {
        throw new Error(`SageMaker validation error: ${error.message}`);
      } else if (error.name === 'ModelError') {
        throw new Error(`SageMaker model error: ${error.message}`);
      } else if (error.name === 'AccessDeniedException') {
        throw new Error('Permission denied to invoke SageMaker endpoint. Check IAM permissions.');
      } else {
        throw new Error(`SageMaker error: ${error.message}`);
      }
    }
  }

  async setTone(request: CBTToneRequest): Promise<void> {
    // If your model supports tone setting, implement it here
    // Otherwise, this can be a no-op or store preference locally
    console.log('Tone setting requested:', request);
    // You might want to include this in the next chat request instead
  }

  async getPersonas(): Promise<{ personas: string[]; default: string }> {
    // Return supported personas for your model
    return {
      personas: ['empathetic', 'professional', 'friendly', 'active_listener'],
      default: 'empathetic',
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to describe the endpoint
      const { DescribeEndpointCommand } = await import("@aws-sdk/client-sagemaker");
      const sagemakerClient = await import("@aws-sdk/client-sagemaker").then(
        m => new m.SageMakerClient({ region: this.region })
      );
      
      const command = new DescribeEndpointCommand({
        EndpointName: this.endpointName
      });
      
      const response = await sagemakerClient.send(command);
      return response.EndpointStatus === 'InService';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const cbtApi = new CBTApiClient();