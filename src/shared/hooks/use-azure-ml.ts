'use client';

import { useState, useCallback } from 'react';
import type {
    AzureMLInferenceRequest,
    AzureMLInferenceResponse,
    AzureMLErrorResponse,
    UseAzureMLOptions,
    UseAzureMLResult,
} from '@/shared/types/azure-ml';

/**
 * React hook for Azure ML CBT API inference
 * 
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { sendPrompt, isLoading, response, error } = useAzureML({
 *     onSuccess: (res) => console.log('Success:', res),
 *     onError: (err) => console.error('Error:', err),
 *   });
 * 
 *   const handleSend = async () => {
 *     await sendPrompt('Hello, AI!', {
 *       persona: 'empathetic',
 *       session_id: 'convo-123',
 *     });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleSend} disabled={isLoading}>
 *         {isLoading ? 'Sending...' : 'Send'}
 *       </button>
 *       {response && <p>{response.response}</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAzureML(options: UseAzureMLOptions = {}): UseAzureMLResult {
    const {
        onSuccess,
        onError,
        autoRetry = false,
        maxRetries = 3,
    } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [response, setResponse] = useState<AzureMLInferenceResponse | null>(null);

    /**
     * Send a message to Azure ML CBT API endpoint
     * Note: user_id is automatically retrieved from the authenticated session
     */
    const sendPrompt = useCallback(
        async (
            text: string,
            requestOptions: Partial<AzureMLInferenceRequest> = {}
        ): Promise<AzureMLInferenceResponse> => {
            // Reset state
            setError(null);
            setIsLoading(true);

            let lastError: Error | null = null;
            let attempts = 0;

            while (attempts < (autoRetry ? maxRetries : 1)) {
                attempts++;

                try {
                    console.log(`🚀 Sending prompt to Azure ML (attempt ${attempts}/${autoRetry ? maxRetries : 1})`);

                    // Prepare request body
                    // Note: user_id is derived from the auth token on the backend
                    const requestBody = {
                        text,
                        ...requestOptions,
                    };

                    // Make API request (auth via httpOnly cookie)
                    const res = await fetch('/api/azure-ml/inference', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    });

                    // Handle response
                    if (!res.ok) {
                        const errorData: AzureMLErrorResponse = await res.json();
                        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
                    }

                    const data: AzureMLInferenceResponse = await res.json();

                    console.log('✅ Azure ML response received successfully');

                    // Update state
                    setResponse(data);
                    setIsLoading(false);

                    // Call success callback
                    if (onSuccess) {
                        onSuccess(data);
                    }

                    return data;

                } catch (err: any) {
                    lastError = err instanceof Error ? err : new Error(String(err));
                    console.error(`❌ Azure ML request failed (attempt ${attempts}):`, lastError.message);

                    // If not auto-retry or last attempt, break
                    if (!autoRetry || attempts >= maxRetries) {
                        break;
                    }

                    // Wait before retry (exponential backoff)
                    const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }

            // All attempts failed
            setError(lastError!);
            setIsLoading(false);

            if (onError && lastError) {
                onError(lastError);
            }

            throw lastError!;
        },
        [onSuccess, onError, autoRetry, maxRetries]
    );

    /**
     * Reset the hook state
     */
    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setResponse(null);
    }, []);

    return {
        sendPrompt,
        isLoading,
        error,
        response,
        reset,
    };
}

/**
 * Simplified version for one-off requests
 * 
 * @example
 * ```tsx
 * const response = await sendAzureMLMessage('Hello!', {
 *   persona: 'empathetic',
 *   session_id: 'convo-123',
 * });
 * ```
 */
export async function sendAzureMLMessage(
    text: string,
    options: Partial<Omit<AzureMLInferenceRequest, 'text' | 'user_id'>> = {}
): Promise<AzureMLInferenceResponse> {
    const requestBody = {
        text,
        ...options,
    };

    const res = await fetch('/api/azure-ml/inference', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    // Handle response
    if (!res.ok) {
        const errorData: AzureMLErrorResponse = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
}
