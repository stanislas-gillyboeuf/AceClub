import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation";
import { queryKeys } from "@/lib/query-keys";
import type { Conversation, SendMessageRequest } from "@/types/conversation";

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversation.list(),
    queryFn: conversationService.listConversations,
  });
}

export function useUnreadMessagesCount() {
  const { data: conversations } = useConversations();
  return conversations?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0;
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.conversation.detail(id),
    queryFn: () => conversationService.getConversation(id),
    enabled: !!id,
  });
}

export function useMessages(conversationId: string, params?: { before?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.conversation.messages(conversationId, params),
    queryFn: () => conversationService.listMessages(conversationId, params),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) =>
      conversationService.sendMessage(conversationId, data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversation.messagesAll(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationService.markRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Optimistically update unread count instead of re-fetching the whole list
      queryClient.setQueryData<Conversation[]>(queryKeys.conversation.list(), (old) => {
        if (!old) return old;
        return old.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        );
      });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationService.deleteConversation(conversationId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      conversationService.deleteMessage(conversationId, messageId),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversation.messagesAll(variables.conversationId),
      });
    },
  });
}

export function useFindOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) => conversationService.findOrCreateConversation(participantId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
    },
  });
}

export function useMuteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) =>
      conversationService.muteConversation(conversationId, isMuted),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.detail(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.list() });
    },
  });
}
