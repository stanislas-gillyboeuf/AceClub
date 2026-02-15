import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchIntentService } from "@/services/match-intent";
import type { CreateMatchIntentRequest, SwipeRequest } from "@/types/match-intent";

export function useMatchIntents(cursor?: string, limit = 20) {
  return useQuery({
    queryKey: ["match-intent", "list", cursor, limit],
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
    queryKey: ["match-intent", "discover", params],
    queryFn: () => matchIntentService.discover(params),
  });
}

export function useMatchRequests() {
  return useQuery({
    queryKey: ["match-intent", "requests"],
    queryFn: matchIntentService.listRequests,
  });
}

export function useCreateMatchIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchIntentRequest) => matchIntentService.createMatchIntent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intent"] });
    },
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SwipeRequest) => matchIntentService.swipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intent", "discover"] });
      queryClient.invalidateQueries({ queryKey: ["match-intent", "requests"] });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchIntentService.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intent", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchIntentService.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intent", "requests"] });
    },
  });
}

export function useDeleteMatchIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchIntentService.deleteMatchIntent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intent"] });
    },
  });
}
