import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { conversationApi } from "@/api/endpoints/conversation";

const PAGE_SIZE = 50;

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      conversationApi.getMessages(conversationId, {
        before: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      // Use the createdAt of the oldest message as the cursor
      const oldest = lastPage[lastPage.length - 1];
      return oldest?.createdAt;
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      clientMessageId,
    }: {
      conversationId: string;
      content: string;
      clientMessageId?: string;
    }) =>
      conversationApi.sendMessage(conversationId, content, clientMessageId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => conversationApi.deleteMessage(conversationId, messageId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
