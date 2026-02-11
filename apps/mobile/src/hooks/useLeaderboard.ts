import { useInfiniteQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/api/endpoints/leaderboard";

export function useGlobalLeaderboard() {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: ({ pageParam = 1 }) =>
      leaderboardApi.getGlobal({ page: pageParam }),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useOrganizationLeaderboard(orgId: string) {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "organization", orgId],
    queryFn: ({ pageParam = 1 }) =>
      leaderboardApi.getOrganization(orgId, { page: pageParam }),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!orgId,
  });
}

export function useWeeklyLeaderboard() {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "weekly"],
    queryFn: ({ pageParam = 1 }) =>
      leaderboardApi.getWeekly({ page: pageParam }),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
}
