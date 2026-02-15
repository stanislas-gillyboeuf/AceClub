import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/match";
import type {
  CreateMatchRequest,
  UpdateMatchRequest,
  UpdateMatchScoresRequest,
  CreateCommentRequest,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from "@/types/match";

export function useMatch(id: string) {
  return useQuery({
    queryKey: ["match", id],
    queryFn: () => matchService.getMatch(id),
    enabled: !!id,
  });
}

export function useMatches(params?: {
  status?: string;
  userId?: string;
  organizationId?: string;
  participantOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["match", "list", params],
    queryFn: () => matchService.listMatches(params),
  });
}

export function useInfiniteMatches(params?: {
  status?: string;
  userId?: string;
  organizationId?: string;
  participantOnly?: boolean;
  limit?: number;
}) {
  const limit = params?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: ["match", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      matchService.listMatches({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchRequest) => matchService.createMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatchRequest }) =>
      matchService.updateMatch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
    },
  });
}

export function useUpdateMatchScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatchScoresRequest }) =>
      matchService.updateMatchScores(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, venueOrganizationId }: { id: string; venueOrganizationId: string | null }) =>
      matchService.updateVenue(id, venueOrganizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.id] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchService.deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateCommentRequest }) =>
      matchService.createComment(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateCommentRequest }) =>
      matchService.updateComment(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.deleteComment(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateFeedbackRequest }) =>
      matchService.createFeedback(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: UpdateFeedbackRequest }) =>
      matchService.updateFeedback(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.deleteFeedback(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}
