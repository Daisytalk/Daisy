'use client';

import { useState } from 'react';
import { useAzureML } from '@/shared/hooks/use-azure-ml';

/**
 * Example component demonstrating Azure ML integration
 * 
 * This component shows:
 * - Basic prompt sending
 * - Loading states
 * - Error handling
 * - Response display
 * - Advanced parameters (temperature, max_tokens)
 */
export function AzureMLChatExample() {
    const [prompt, setPrompt] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(500);
    const [conversationHistory, setConversationHistory] = useState<
        Array<{ role: 'user' | 'assistant'; content: string }>
    >([]);

    const { sendPrompt, isLoading, error, response } = useAzureML({
        onSuccess: (res) => {
            console.log('✅ Success:', res);

            // Add assistant response to conversation history
            setConversationHistory((prev) => [
                ...prev,
                { role: 'assistant', content: res.response },
            ]);

            // Clear input
            setPrompt('');
        },
        onError: (err) => {
            console.error('❌ Error:', err);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim()) return;

        // Add user message to conversation history
        setConversationHistory((prev) => [
            ...prev,
            { role: 'user', content: prompt },
        ]);

        try {
            await sendPrompt(prompt, {
                temperature,
                max_tokens: maxTokens,
            });
        } catch (err) {
            // Error is already handled by the hook
            console.error('Failed to send prompt:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Azure ML Chat
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Powered by Azure Machine Learning
                    </p>
                </div>

                {/* Conversation History */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {conversationHistory.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                            <p className="text-lg">Start a conversation!</p>
                            <p className="text-sm mt-2">Type a message below to begin.</p>
                        </div>
                    ) : (
                        conversationHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                ❌ Error: {error.message}
                            </p>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Advanced Parameters */}
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <label className="text-gray-700 dark:text-gray-300">
                                    Temperature:
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-24"
                                    disabled={isLoading}
                                />
                                <span className="text-gray-600 dark:text-gray-400 w-8">
                                    {temperature.toFixed(1)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-gray-700 dark:text-gray-300">
                                    Max Tokens:
                                </label>
                                <input
                                    type="number"
                                    min="50"
                                    max="2000"
                                    step="50"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>

                    {/* Metadata Display */}
                    {response?.metadata && (
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            Response time: {response.duration}ms
                            {response.usage && (
                                <span className="ml-4">
                                    Tokens: {response.usage.total_tokens}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Simpler example for a single prompt/response
 */
export function SimpleAzureMLExample() {
    const [prompt, setPrompt] = useState('');
    const { sendPrompt, isLoading, error, response } = useAzureML();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim()) return;

        try {
            await sendPrompt(prompt);
        } catch (err) {
            // Error handled by hook
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask something..."
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Send'}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Error: {error.message}</p>
                </div>
            )}

            {response && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{response.response}</p>
                </div>
            )}
        </div>
    );
}
