/**
 * Azure ML Service for CBT Therapy API
 * Handles communication with Azure-hosted CBT Therapy API endpoint
 * 
 * This service is specifically designed for the CBT Therapy API format:
 * - Uses x-api-key authentication (not Bearer token)
 * - Expects: { text, user_id, session_id, persona }
 * - Returns: { response, protocol_used, diagnosis, persona_used, tone }
 */

export interface AzureMLConfig {
    endpointUrl: string;
    apiKey: string;
    timeout?: number; // milliseconds
}

/**
 * CBT API Request Format
 * Matches your existing CBT API implementation
 */
export interface AzureMLChatRequest {
    text: string;           // The user's message
    user_id: string;        // User identifier
    session_id?: string;    // Optional session/conversation ID
    persona?: string;       // Optional persona preference
}

/**
 * CBT API Response Format
 * Matches your existing CBT API implementation
 */
export interface AzureMLChatResponse {
    response: string;           // The AI's response text
    protocol_used?: string;     // CBT protocol used
    diagnosis?: string[];       // Diagnosed issues
    persona_used?: string;      // Persona that was used
    tone?: string;              // Tone of response
    protocol?: string;          // Alternative protocol field
    status?: string;            // Status of the response
}

export interface AzureMLError {
    error: string;
    details?: string;
    status?: number;
    code?: string;
}

export class AzureMLService {
    private config: AzureMLConfig;

    constructor(config: AzureMLConfig) {
        this.config = {
            timeout: 30000, // 30 seconds default timeout
            ...config,
        };
    }

    /**
     * Send a chat request to Azure ML CBT API endpoint
     * @param request - The chat request payload (text, user_id, session_id, persona)
     * @returns The CBT API response
     * @throws Error if the request fails
     */
    async chat(request: AzureMLChatRequest): Promise<AzureMLChatResponse> {
        const { endpointUrl, apiKey, timeout } = this.config;

        // Validate configuration
        if (!endpointUrl || !apiKey) {
            throw new Error('Azure ML endpoint URL and API key are required');
        }

        console.log('🔵 Azure ML CBT API: Sending request to endpoint');
        console.log('🔵 Endpoint:', endpointUrl);
        console.log('🔵 Request payload:', {
            text: request.text.substring(0, 100) + '...',
            user_id: request.user_id,
            session_id: request.session_id,
            persona: request.persona,
        });

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Prepare payload matching CBT API format
            const payload = {
                text: request.text,
                user_id: request.user_id,
                session_id: request.session_id,
                persona: request.persona,
            };

            // Make the request with x-api-key authentication (not Bearer)
            const response = await fetch(`${endpointUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,  // CBT API uses x-api-key, not Bearer
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log('📥 Azure ML CBT API response status:', response.status, response.statusText);

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔴 Azure ML CBT API error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                });

                throw new Error(
                    `Azure ML CBT API error: ${response.status} ${response.statusText} - ${errorText}`
                );
            }

            // Get raw response text first for debugging
            const responseText = await response.text();
            console.log('📄 Raw response text:', responseText.substring(0, 500));

            if (!responseText || responseText.trim() === '' || responseText === 'null') {
                throw new Error('Azure ML CBT API returned empty or null response');
            }

            // Parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error(`Invalid JSON from Azure ML CBT API: ${responseText.substring(0, 100)}`);
            }

            console.log('✅ Azure ML CBT API: Response received successfully');

            // Check if we got a valid response
            const responseContent = data?.response || data?.body?.response || data?.message;
            if (!responseContent) {
                console.error('❌ No response content found in:', data);
                throw new Error('Azure ML CBT API returned response without content.');
            }

            console.log('✅ Response preview:', {
                hasResponse: !!responseContent,
                responseLength: responseContent.length,
                protocol: data.protocol || data.body?.protocol,
                persona: data.tone || data.body?.tone || data.persona,
            });

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
            // Handle timeout
            if (error.name === 'AbortError') {
                console.error('🔴 Azure ML CBT API request timeout after', timeout, 'ms');
                throw new Error(`Azure ML CBT API request timeout after ${timeout}ms`);
            }

            // Handle network errors
            if (error.message.includes('fetch')) {
                console.error('🔴 Azure ML CBT API network error:', error.message);
                throw new Error(`Network error connecting to Azure ML CBT API: ${error.message}`);
            }

            // Re-throw other errors
            console.error('🔴 Azure ML CBT API unexpected error:', error);
            throw error;
        }
    }

    /**
     * Test connection to Azure ML CBT API endpoint
     * @returns true if connection is successful
     */
    async testConnection(): Promise<boolean> {
        try {
            // Send a simple test request
            await this.chat({
                text: 'test',
                user_id: 'test_user',
            });
            return true;
        } catch (error) {
            console.error('Azure ML CBT API connection test failed:', error);
            return false;
        }
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<AzureMLConfig>) {
        this.config = {
            ...this.config,
            ...config,
        };
    }
}

// Singleton instance for the application
let azureMLInstance: AzureMLService | null = null;

/**
 * Get or create Azure ML CBT API service instance
 */
export function getAzureMLService(): AzureMLService {
    if (!azureMLInstance) {
        const endpointUrl = process.env.CBT_API_URL;
        const apiKey = process.env.CBT_API_KEY;
        const timeout = process.env.CBT_API_TIMEOUT
            ? parseInt(process.env.CBT_API_TIMEOUT, 10)
            : 30000;

        if (!endpointUrl || !apiKey) {
            throw new Error(
                'Azure ML CBT API configuration missing. Please set CBT_API_URL and CBT_API_KEY in your environment variables.'
            );
        }

        azureMLInstance = new AzureMLService({
            endpointUrl,
            apiKey,
            timeout,
        });
    }

    return azureMLInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAzureMLService() {
    azureMLInstance = null;
}
