import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "@/api/endpoints/conversation";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationApi.list(),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationApi.get(id),
    enabled: !!id,
  });
}

export function useFindOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: string) =>
      conversationApi.findOrCreate(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMuteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      isMuted,
    }: {
      conversationId: string;
      isMuted: boolean;
    }) => conversationApi.mute(conversationId, isMuted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.delete(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
