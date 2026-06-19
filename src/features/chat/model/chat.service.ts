import { API_CONFIG, getAuthHeaders } from '@/shared/api/config'
import type { DaisyState } from '@/shared/types/daisy'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SendMessageRequest {
  messages: ChatMessage[]
  sessionId?: string | null
}

export interface SendMessageResponse {
  requestId: string
  conversationId: string
}

export interface MessageStatusResponse {
  status: 'processing' | 'completed' | 'failed'
  response?: string
  daisy_state?: DaisyState | null
  error?: string
}

export interface ConversationMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

export interface ConversationResponse {
  id: string
  messages: ConversationMessage[]
}

export class ChatService {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }

    const data = await response.json()
    const conversationId = response.headers.get('X-Session-Id') || data.conversationId

    return {
      requestId: data.requestId,
      conversationId,
    }
  }

  async getMessageStatus(requestId: string): Promise<MessageStatusResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat/status/${requestId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to get message status: ${response.status}`)
    }

    return response.json()
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/cbt/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.status}`)
    }

    return response.json()
  }
}
