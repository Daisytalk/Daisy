/**
 * Type definitions for Azure ML CBT API integration
 */

// ============================================
// REQUEST TYPES
// ============================================

export interface AzureMLInferenceRequest {
    /** The user's message/text */
    text: string;

    /** User ID */
    user_id: string;

    /** Optional session/conversation ID for tracking */
    session_id?: string;

    /** Optional persona preference */
    persona?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface AzureMLInferenceResponse {
    /** The AI model's response text */
    response: string;

    /** CBT protocol used */
    protocol_used?: string;

    /** Diagnosed issues */
    diagnosis?: string[];

    /** Persona that was used */
    persona_used?: string;

    /** Tone of response */
    tone?: string;

    /** Alternative protocol field */
    protocol?: string;

    /** Status of the response */
    status?: string;

    /** Response time in milliseconds (added by API route) */
    duration?: number;

    /** Conversation ID (echoed back if provided) */
    conversationId?: string;
}

export interface AzureMLErrorResponse {
    /** Error message */
    error: string;

    /** Detailed error information */
    details?: string;

    /** HTTP status code */
    status?: number;
}

// ============================================
// FRONTEND HOOK TYPES
// ============================================

export interface UseAzureMLOptions {
    /** Callback when inference succeeds */
    onSuccess?: (response: AzureMLInferenceResponse) => void;

    /** Callback when inference fails */
    onError?: (error: Error) => void;

    /** Auto-retry on failure (default: false) */
    autoRetry?: boolean;

    /** Maximum retry attempts (default: 3) */
    maxRetries?: number;
}

export interface UseAzureMLResult {
    /** Send a message to Azure ML CBT API */
    sendPrompt: (text: string, options?: Partial<AzureMLInferenceRequest>) => Promise<AzureMLInferenceResponse>;

    /** Whether a request is currently in progress */
    isLoading: boolean;

    /** Error from the last request (if any) */
    error: Error | null;

    /** Response from the last successful request */
    response: AzureMLInferenceResponse | null;

    /** Reset the state */
    reset: () => void;
}

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface AzureMLConfig {
    /** Azure ML CBT API endpoint URL */
    endpointUrl: string;

    /** Azure ML CBT API key */
    apiKey: string;

    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
}
