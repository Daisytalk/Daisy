import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChatService, type SendMessageRequest } from './chat.service'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/utils/error-handler'

const chatService = new ChatService()

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SendMessageRequest) => chatService.sendMessage(request),
    onSuccess: async (data) => {
      if (data.conversationId) {
        await queryClient.invalidateQueries({ 
          queryKey: ['conversation', data.conversationId] 
        })
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useMessageStatus(requestId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['messageStatus', requestId],
    queryFn: () => chatService.getMessageStatus(requestId!),
    enabled: enabled && !!requestId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      return 5000
    },
  })
}

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatService.getConversation(conversationId!),
    enabled: !!conversationId && !conversationId.startsWith('temp_'),
  })
}
