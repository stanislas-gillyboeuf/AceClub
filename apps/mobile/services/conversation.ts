import { api } from "@/lib/api";
import type {
  Conversation,
  Message,
  SendMessageRequest,
  UploadAttachmentResponse,
  FindOrCreateConversationResponse,
} from "@/types/conversation";

export const conversationService = {
  listConversations: () =>
    api.get<Conversation[]>("/conversation"),

  getConversation: (id: string) =>
    api.get<Conversation>(`/conversation/${id}`),

  listMessages: (conversationId: string, params?: { before?: string; limit?: number }) =>
    api.get<Message[]>(`/conversation/${conversationId}/messages`, {
      limit: params?.limit ?? 50,
      before: params?.before,
    }),

  sendMessage: (conversationId: string, data: SendMessageRequest) =>
    api.post<Message>(`/conversation/${conversationId}/message`, data),

  markRead: (conversationId: string) =>
    api.post<void>(`/conversation/${conversationId}/mark-read`),

  deleteConversation: (conversationId: string) =>
    api.delete<void>(`/conversation/${conversationId}`),

  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete<void>(`/conversation/${conversationId}/message/${messageId}`),

  findOrCreateConversation: (participantId: string) =>
    api.post<FindOrCreateConversationResponse>("/conversation/find-or-create", { participantId }),

  muteConversation: (conversationId: string, isMuted: boolean) =>
    api.post<void>(`/conversation/${conversationId}/mute`, { isMuted }),
};
