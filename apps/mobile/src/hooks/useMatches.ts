import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { matchApi } from "@/api/endpoints/match";
import type { MatchFilters, CreateMatchPayload } from "@/types/match";

export function useMatches(filters: MatchFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["matches", filters],
    queryFn: ({ pageParam = 1 }) =>
      matchApi.list({ ...filters, page: pageParam }),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useFeedMatches(organizationId?: string) {
  return useMatches({
    participantOnly: !organizationId,
    organizationId,
    limit: 20,
  });
}

export function useMyMatches(status?: MatchFilters["status"]) {
  return useMatches({
    participantOnly: true,
    status,
    limit: 20,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMatchPayload) => matchApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => matchApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
