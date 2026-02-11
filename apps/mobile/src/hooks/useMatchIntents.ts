import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { matchIntentApi } from "@/api/endpoints/match-intent";

export function useMyMatchIntents() {
  return useQuery({
    queryKey: ["match-intents", "my"],
    queryFn: () => matchIntentApi.getMyIntents(),
  });
}

export function useDiscoverIntents(params: {
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["match-intents", "discover", params],
    queryFn: ({ pageParam }) =>
      matchIntentApi.discover({ ...params, cursor: pageParam }),
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!params.latitude && !!params.longitude,
  });
}

export function useCreateMatchIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: matchIntentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents"] });
    },
  });
}

export function useDeleteMatchIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => matchIntentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents"] });
    },
  });
}

export function useSwipeIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchIntentId,
      action,
    }: {
      matchIntentId: string;
      action: "like" | "pass";
    }) => matchIntentApi.swipe(matchIntentId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match-intents", "discover"],
      });
    },
  });
}

export function useReceivedRequests() {
  return useQuery({
    queryKey: ["match-requests", "received"],
    queryFn: () => matchIntentApi.getReceivedRequests(),
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      matchIntentApi.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-requests"] });
      queryClient.invalidateQueries({ queryKey: ["match-intents"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      matchIntentApi.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-requests"] });
    },
  });
}
