import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchApi } from "@/api/endpoints/match";
import type { UpdateMatchPayload, UpdateScoresPayload } from "@/types/match";

export function useMatchDetail(id: string) {
  return useQuery({
    queryKey: ["match", id],
    queryFn: () => matchApi.getDetail(id),
    enabled: !!id,
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatchPayload }) =>
      matchApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateMatchScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScoresPayload }) =>
      matchApi.updateScores(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useAddMatchComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, content }: { matchId: string; content: string }) =>
      matchApi.addComment(matchId, content),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateMatchComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, content }: { matchId: string; content: string }) =>
      matchApi.updateComment(matchId, content),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}

export function useDeleteMatchComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchApi.deleteComment(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}
