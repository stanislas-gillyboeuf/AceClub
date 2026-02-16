import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation";
import type { SendMessageRequest } from "@/types/conversation";

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
    onSuccess: (_, variables) => {
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
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      conversationService.deleteMessage(conversationId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId, "messages"] });
    },
  });
}

export function useFindOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) => conversationService.findOrCreateConversation(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}

export function useMuteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) =>
      conversationService.muteConversation(conversationId, isMuted),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", "list"] });
    },
  });
}
