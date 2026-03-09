import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/match";
import type {
  MatchDetail,
  CreateMatchRequest,
  UpdateMatchRequest,
  UpdateMatchScoresRequest,
  CreateCommentRequest,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from "@/types/match";
import type { User } from "@/types/user";

// --- Queries ---

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

// --- Helpers ---

function getMe(queryClient: ReturnType<typeof useQueryClient>): User | undefined {
  return queryClient.getQueryData<User>(["user", "me"]);
}

function getMatchDetail(queryClient: ReturnType<typeof useQueryClient>, id: string): MatchDetail | undefined {
  return queryClient.getQueryData<MatchDetail>(["match", id]);
}

async function cancelAndSnapshot(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  await queryClient.cancelQueries({ queryKey: ["match", id] });
  return getMatchDetail(queryClient, id);
}

function rollback(queryClient: ReturnType<typeof useQueryClient>, id: string, previous: MatchDetail | undefined) {
  if (previous) {
    queryClient.setQueryData(["match", id], previous);
  }
}

function settleMatch(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: ["match", id] });
  queryClient.invalidateQueries({ queryKey: ["match", "list"] });
  queryClient.invalidateQueries({ queryKey: ["match", "infinite"] });
}

// --- Mutations ---

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchRequest) => matchService.createMatch(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
      queryClient.invalidateQueries({ queryKey: ["match", "infinite"] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatchRequest }) =>
      matchService.updateMatch(id, data),
    onMutate: async ({ id, data }) => {
      const previous = await cancelAndSnapshot(queryClient, id);
      if (previous) {
        queryClient.setQueryData<MatchDetail>(["match", id], {
          ...previous,
          match: { ...previous.match, ...data },
        });
      }
      return { previous };
    },
    onError: (_err, { id }, context) => {
      rollback(queryClient, id, context?.previous);
    },
    onSettled: (_, __, { id }) => {
      settleMatch(queryClient, id);
    },
  });
}

export function useUpdateMatchScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatchScoresRequest }) =>
      matchService.updateMatchScores(id, data),
    onMutate: async ({ id, data }) => {
      const previous = await cancelAndSnapshot(queryClient, id);
      if (previous) {
        const updatedSets = previous.sets.map((existingSet) => {
          const incoming = data.sets.find((s) => s.setNumber === existingSet.setNumber);
          if (!incoming) return existingSet;
          return {
            ...existingSet,
            scores: incoming.scores.map((s) => {
              const existing = existingSet.scores?.find((es) => es.userId === s.userId);
              return {
                participantId: existing?.participantId ?? "",
                userId: s.userId,
                side: existing?.side ?? null,
                games: s.score,
              };
            }),
          };
        });
        // Add new sets that don't exist yet
        for (const incoming of data.sets) {
          if (!previous.sets.some((s) => s.setNumber === incoming.setNumber)) {
            updatedSets.push({
              id: `optimistic-${incoming.setNumber}`,
              matchId: id,
              setNumber: incoming.setNumber,
              createdAt: new Date().toISOString(),
              scores: incoming.scores.map((s) => ({
                participantId: "",
                userId: s.userId,
                side: null,
                games: s.score,
              })),
            });
          }
        }
        queryClient.setQueryData<MatchDetail>(["match", id], {
          ...previous,
          sets: updatedSets.sort((a, b) => a.setNumber - b.setNumber),
        });
      }
      return { previous };
    },
    onError: (_err, { id }, context) => {
      rollback(queryClient, id, context?.previous);
    },
    onSettled: (_, __, { id }) => {
      settleMatch(queryClient, id);
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, venueOrganizationId }: { id: string; venueOrganizationId: string | null }) =>
      matchService.updateVenue(id, venueOrganizationId),
    onMutate: async ({ id, venueOrganizationId }) => {
      const previous = await cancelAndSnapshot(queryClient, id);
      if (previous) {
        queryClient.setQueryData<MatchDetail>(["match", id], {
          ...previous,
          match: { ...previous.match, venueOrganizationId },
          venueOrganization: venueOrganizationId === null ? null : previous.venueOrganization,
        });
      }
      return { previous };
    },
    onError: (_err, { id }, context) => {
      rollback(queryClient, id, context?.previous);
    },
    onSettled: (_, __, { id }) => {
      settleMatch(queryClient, id);
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchService.deleteMatch(id),
    onMutate: async (id) => {
      const previous = await cancelAndSnapshot(queryClient, id);
      queryClient.removeQueries({ queryKey: ["match", id] });
      return { previous, id };
    },
    onError: (_err, id, context) => {
      rollback(queryClient, id, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "list"] });
      queryClient.invalidateQueries({ queryKey: ["match", "infinite"] });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateCommentRequest }) =>
      matchService.createComment(matchId, data),
    onMutate: async ({ matchId, data }) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous) {
        const me = getMe(queryClient);
        const now = new Date().toISOString();
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          comments: [
            ...(previous.comments ?? []),
            {
              id: `optimistic-${Date.now()}`,
              matchId,
              userId: me?.id ?? "",
              content: data.content,
              createdAt: now,
              updatedAt: now,
              user: me ? { id: me.id, name: me.name, image: me.image } : null,
            },
          ],
        });
      }
      return { previous };
    },
    onError: (_err, { matchId }, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, { matchId }) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateCommentRequest }) =>
      matchService.updateComment(matchId, data),
    onMutate: async ({ matchId, data }) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous) {
        const me = getMe(queryClient);
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          comments: (previous.comments ?? []).map((c) =>
            c.userId === me?.id
              ? { ...c, content: data.content, updatedAt: new Date().toISOString() }
              : c
          ),
        });
      }
      return { previous };
    },
    onError: (_err, { matchId }, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, { matchId }) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.deleteComment(matchId),
    onMutate: async (matchId) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous) {
        const me = getMe(queryClient);
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          comments: (previous.comments ?? []).filter((c) => c.userId !== me?.id),
        });
      }
      return { previous };
    },
    onError: (_err, matchId, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, matchId) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateFeedbackRequest }) =>
      matchService.createFeedback(matchId, data),
    onMutate: async ({ matchId, data }) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous) {
        const me = getMe(queryClient);
        const now = new Date().toISOString();
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          myFeedback: {
            id: `optimistic-${Date.now()}`,
            matchId,
            userId: me?.id ?? "",
            sensation: data.sensation,
            comment: data.comment ?? null,
            visibleToClub: data.visibleToClub,
            createdAt: now,
            updatedAt: now,
          },
        });
      }
      return { previous };
    },
    onError: (_err, { matchId }, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, { matchId }) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: UpdateFeedbackRequest }) =>
      matchService.updateFeedback(matchId, data),
    onMutate: async ({ matchId, data }) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous && previous.myFeedback) {
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          myFeedback: {
            ...previous.myFeedback,
            ...(data.sensation !== undefined && data.sensation !== null && { sensation: data.sensation }),
            ...(data.comment !== undefined && { comment: data.comment ?? null }),
            ...(data.visibleToClub !== undefined && data.visibleToClub !== null && { visibleToClub: data.visibleToClub }),
            updatedAt: new Date().toISOString(),
          },
        });
      }
      return { previous };
    },
    onError: (_err, { matchId }, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, { matchId }) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useUploadMatchPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, uri, fileName, mimeType }: { matchId: string; uri: string; fileName: string; mimeType: string }) =>
      matchService.uploadMatchPhoto(matchId, uri, fileName, mimeType),
    onSuccess: (data, { matchId }) => {
      // Eagerly update cache with server response to avoid waiting for refetch
      const previous = getMatchDetail(queryClient, matchId);
      if (previous && data?.photo) {
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          photos: [...(previous.photos ?? []), data.photo],
        });
      }
    },
    onSettled: (_, __, { matchId }) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useDeleteMatchPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.deleteMatchPhoto(matchId),
    onMutate: async (matchId) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous) {
        const me = getMe(queryClient);
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          photos: (previous.photos ?? []).filter((p) => p.userId !== me?.id),
        });
      }
      return { previous };
    },
    onError: (_err, matchId, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, matchId) => {
      settleMatch(queryClient, matchId);
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.deleteFeedback(matchId),
    onMutate: async (matchId) => {
      const previous = await cancelAndSnapshot(queryClient, matchId);
      if (previous) {
        queryClient.setQueryData<MatchDetail>(["match", matchId], {
          ...previous,
          myFeedback: null,
        });
      }
      return { previous };
    },
    onError: (_err, matchId, context) => {
      rollback(queryClient, matchId, context?.previous);
    },
    onSettled: (_, __, matchId) => {
      settleMatch(queryClient, matchId);
    },
  });
}
