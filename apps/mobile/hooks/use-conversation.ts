import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation";
import type { Conversation, SendMessageRequest } from "@/types/conversation";

export function useConversations() {
  return useQuery({
    queryKey: ["conversation", "list"],
    queryFn: conversationService.listConversations,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationService.getConversation(id),
    enabled: !!id,
  });
}

export function useMessages(conversationId: string, params?: { before?: string; limit?: number }) {
  return useQuery({
    queryKey: ["conversation", conversationId, "messages", params],
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
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationService.markRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Optimistically update unread count instead of re-fetching the whole list
      queryClient.setQueryData<Conversation[]>(["conversation", "list"], (old) => {
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
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      conversationService.deleteMessage(conversationId, messageId),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId, "messages"] });
    },
  });
}

export function useFindOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) => conversationService.findOrCreateConversation(participantId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}

export function useMuteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) =>
      conversationService.muteConversation(conversationId, isMuted),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}
