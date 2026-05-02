import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchIntentService } from "@/services/match-intent";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMatchIntentRequest, SwipeRequest } from "@/types/match-intent";

export function useMatchIntents(cursor?: string, limit = 20) {
  return useQuery({
    queryKey: queryKeys.matchIntent.list(cursor, limit),
    queryFn: () => matchIntentService.listMatchIntents(cursor, limit),
  });
}

export function useDiscover(params?: {
  cursor?: string;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  return useQuery({
    queryKey: queryKeys.matchIntent.discover(params),
    queryFn: () => matchIntentService.discover(params),
  });
}

export function useMatchRequests() {
  return useQuery({
    queryKey: queryKeys.matchIntent.requests(),
    queryFn: matchIntentService.listRequests,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMatchIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchIntentRequest) => matchIntentService.createMatchIntent(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchIntent.all });
    },
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SwipeRequest) => matchIntentService.swipe(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchIntent.discoverAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matchIntent.requests() });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchIntentService.acceptRequest(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchIntent.requests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.match.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation.all });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchIntentService.rejectRequest(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchIntent.requests() });
    },
  });
}

export function useDeleteMatchIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchIntentService.deleteMatchIntent(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchIntent.all });
    },
  });
}
