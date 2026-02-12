import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Match,
  CreateMatchData,
  UpdateScoresData,
  CreateMatchIntentData,
} from "@/types/match";

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchData) =>
      apiClient<Match>("/match", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateMatchScores(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateScoresData) =>
      apiClient(`/match/${matchId}/scores`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateMatchStatus(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status?: string; scheduledAt?: string; startedAt?: string; finishedAt?: string; winnerId?: string | null }) =>
      apiClient(`/match/${matchId}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateMatch(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status?: string; scheduledAt?: string; startedAt?: string; finishedAt?: string }) =>
      apiClient(`/match/${matchId}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => apiClient(`/match/${matchId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useCreateComment(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string }) =>
      apiClient(`/match/${matchId}/comment`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}

export function useCreateFeedback(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      apiClient(`/match/${matchId}/feedback`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}

export function useCreateMatchIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchIntentData) =>
      apiClient("/match-intents", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents"] });
    },
  });
}

export function useDeleteMatchIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (intentId: string) => apiClient(`/match-intents/${intentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents"] });
    },
  });
}

export function useSwipeIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { intentId: string; direction: "like" | "pass" }) =>
      apiClient("/match-intents/swipe", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents", "discover"] });
      queryClient.invalidateQueries({ queryKey: ["match-intents", "requests"] });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiClient(`/match-intents/requests/${requestId}/accept`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiClient(`/match-intents/requests/${requestId}/reject`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-intents", "requests"] });
    },
  });
}
