import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { matchService } from "@/services/match";
import { queryKeys } from "@/lib/query-keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { getNextPageParamFromPagination } from "@/hooks/use-infinite-pagination";
import type {
  MatchDetail,
  MatchWithParticipants,
  ListMatchesResponse,
  CreateMatchRequest,
  UpdateMatchRequest,
  UpdateMatchScoresRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from "@/types/match";
import type { User } from "@/types/user";

// --- Queries ---

export function useMatch(id: string) {
  return useQuery({
    queryKey: queryKeys.match.detail(id),
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
    queryKey: queryKeys.match.list(params),
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
    queryKey: queryKeys.match.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      matchService.listMatches({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: getNextPageParamFromPagination,
  });
}

const matchInvalidationKeys = (matchId: string) => [
  queryKeys.match.detail(matchId),
  queryKeys.match.lists(),
  queryKeys.match.infiniteAll(),
];

// --- Mutations ---

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchRequest) => matchService.createMatch(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.match.infiniteAll() });
    },
  });
}

export function useUpdateMatch() {
  return useOptimisticMutation<
    { id: string; data: UpdateMatchRequest },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ id, data }) => matchService.updateMatch(id, data),
    queryKey: ({ id }) => queryKeys.match.detail(id),
    optimisticUpdate: (previous, { data }) => ({
      ...previous,
      match: { ...previous.match, ...data },
    }),
    invalidate: ({ id }) => matchInvalidationKeys(id),
  });
}

export function useUpdateMatchScores() {
  return useOptimisticMutation<
    { id: string; data: UpdateMatchScoresRequest },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ id, data }) => matchService.updateMatchScores(id, data),
    queryKey: ({ id }) => queryKeys.match.detail(id),
    optimisticUpdate: (previous, { id, data }) => {
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
      return {
        ...previous,
        sets: updatedSets.sort((a, b) => a.setNumber - b.setNumber),
      };
    },
    invalidate: ({ id }) => matchInvalidationKeys(id),
  });
}

export function useUpdateVenue() {
  return useOptimisticMutation<
    { id: string; venueOrganizationId: string | null },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ id, venueOrganizationId }) =>
      matchService.updateVenue(id, venueOrganizationId),
    queryKey: ({ id }) => queryKeys.match.detail(id),
    optimisticUpdate: (previous, { venueOrganizationId }) => ({
      ...previous,
      match: { ...previous.match, venueOrganizationId },
      venueOrganization: venueOrganizationId === null ? null : previous.venueOrganization,
    }),
    invalidate: ({ id }) => matchInvalidationKeys(id),
  });
}

export function useDeleteMatch() {
  return useOptimisticMutation<string, unknown, MatchDetail>({
    mutationFn: (id) => matchService.deleteMatch(id),
    queryKey: (id) => queryKeys.match.detail(id),
    removeOnMutate: true,
    invalidate: () => [queryKeys.match.lists(), queryKeys.match.infiniteAll()],
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useOptimisticMutation<
    { matchId: string; data: CreateCommentRequest },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ matchId, data }) => matchService.createComment(matchId, data),
    queryKey: ({ matchId }) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous, { matchId, data }) => {
      const me = queryClient.getQueryData<User>(queryKeys.user.me());
      const now = new Date().toISOString();
      return {
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
      };
    },
    invalidate: ({ matchId }) => matchInvalidationKeys(matchId),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useOptimisticMutation<
    { matchId: string; data: UpdateCommentRequest },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ matchId, data }) => matchService.updateComment(matchId, data),
    queryKey: ({ matchId }) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous, { data }) => {
      const me = queryClient.getQueryData<User>(queryKeys.user.me());
      return {
        ...previous,
        comments: (previous.comments ?? []).map((c) =>
          c.userId === me?.id
            ? { ...c, content: data.content, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    },
    invalidate: ({ matchId }) => matchInvalidationKeys(matchId),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useOptimisticMutation<string, unknown, MatchDetail>({
    mutationFn: (matchId) => matchService.deleteComment(matchId),
    queryKey: (matchId) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous) => {
      const me = queryClient.getQueryData<User>(queryKeys.user.me());
      return {
        ...previous,
        comments: (previous.comments ?? []).filter((c) => c.userId !== me?.id),
      };
    },
    invalidate: (matchId) => matchInvalidationKeys(matchId),
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useOptimisticMutation<
    { matchId: string; data: CreateFeedbackRequest },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ matchId, data }) => matchService.createFeedback(matchId, data),
    queryKey: ({ matchId }) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous, { matchId, data }) => {
      const me = queryClient.getQueryData<User>(queryKeys.user.me());
      const now = new Date().toISOString();
      return {
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
      };
    },
    invalidate: ({ matchId }) => matchInvalidationKeys(matchId),
  });
}

export function useUpdateFeedback() {
  return useOptimisticMutation<
    { matchId: string; data: UpdateFeedbackRequest },
    unknown,
    MatchDetail
  >({
    mutationFn: ({ matchId, data }) => matchService.updateFeedback(matchId, data),
    queryKey: ({ matchId }) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous, { data }) => {
      if (!previous.myFeedback) return previous;
      return {
        ...previous,
        myFeedback: {
          ...previous.myFeedback,
          ...(data.sensation !== undefined && data.sensation !== null && { sensation: data.sensation }),
          ...(data.comment !== undefined && { comment: data.comment ?? null }),
          ...(data.visibleToClub !== undefined && data.visibleToClub !== null && { visibleToClub: data.visibleToClub }),
          updatedAt: new Date().toISOString(),
        },
      };
    },
    invalidate: ({ matchId }) => matchInvalidationKeys(matchId),
  });
}

export function useDeleteFeedback() {
  return useOptimisticMutation<string, unknown, MatchDetail>({
    mutationFn: (matchId) => matchService.deleteFeedback(matchId),
    queryKey: (matchId) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous) => ({ ...previous, myFeedback: null }),
    invalidate: (matchId) => matchInvalidationKeys(matchId),
  });
}

export function useUploadMatchPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, uri, fileName, mimeType }: { matchId: string; uri: string; fileName: string; mimeType: string }) =>
      matchService.uploadMatchPhoto(matchId, uri, fileName, mimeType),
    onSuccess: (data, { matchId }) => {
      const previous = queryClient.getQueryData<MatchDetail>(queryKeys.match.detail(matchId));
      if (previous && data?.photo) {
        queryClient.setQueryData<MatchDetail>(queryKeys.match.detail(matchId), {
          ...previous,
          photos: [...(previous.photos ?? []), data.photo],
        });
      }
    },
    onSettled: (_data, _err, { matchId }) => {
      for (const key of matchInvalidationKeys(matchId)) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function useDeleteMatchPhoto() {
  const queryClient = useQueryClient();
  return useOptimisticMutation<string, unknown, MatchDetail>({
    mutationFn: (matchId) => matchService.deleteMatchPhoto(matchId),
    queryKey: (matchId) => queryKeys.match.detail(matchId),
    optimisticUpdate: (previous) => {
      const me = queryClient.getQueryData<User>(queryKeys.user.me());
      return {
        ...previous,
        photos: (previous.photos ?? []).filter((p) => p.userId !== me?.id),
      };
    },
    invalidate: (matchId) => matchInvalidationKeys(matchId),
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.toggleLike(matchId),
    onMutate: async (matchId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.match.infiniteAll() });
      await queryClient.cancelQueries({ queryKey: queryKeys.match.detail(matchId) });

      const previousInfinite = queryClient.getQueriesData<{ pages: ListMatchesResponse[] }>({
        queryKey: queryKeys.match.infiniteAll(),
      });
      const previousDetail = queryClient.getQueryData<MatchDetail>(queryKeys.match.detail(matchId));

      queryClient.setQueriesData<{ pages: ListMatchesResponse[]; pageParams: number[] }>(
        { queryKey: queryKeys.match.infiniteAll() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              matches: page.matches.map((m) =>
                m.id === matchId
                  ? {
                      ...m,
                      hasLiked: !m.hasLiked,
                      likesCount: m.hasLiked ? m.likesCount - 1 : m.likesCount + 1,
                    }
                  : m,
              ),
            })),
          };
        },
      );

      if (previousDetail) {
        queryClient.setQueryData<MatchDetail>(queryKeys.match.detail(matchId), {
          ...previousDetail,
          hasLiked: !previousDetail.hasLiked,
          likesCount: previousDetail.hasLiked
            ? previousDetail.likesCount - 1
            : previousDetail.likesCount + 1,
        });
      }

      return { previousInfinite, previousDetail };
    },
    onError: (_err, matchId, context) => {
      if (context?.previousInfinite) {
        for (const [queryKey, data] of context.previousInfinite) {
          if (data) queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.match.detail(matchId), context.previousDetail);
      }
    },
    onSettled: (_, __, matchId) => {
      for (const key of matchInvalidationKeys(matchId)) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export type { MatchWithParticipants };
