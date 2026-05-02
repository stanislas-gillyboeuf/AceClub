import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { leaderboardService } from "@/services/leaderboard";
import { queryKeys } from "@/lib/query-keys";
import { getNextPageParamFromPagination } from "@/hooks/use-infinite-pagination";

export function useGlobalLeaderboard(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.leaderboard.global(page, limit),
    queryFn: () => leaderboardService.getGlobalLeaderboard(page, limit),
  });
}

export function useOrganizationLeaderboard(organizationId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.leaderboard.organization(organizationId, page, limit),
    queryFn: () => leaderboardService.getOrganizationLeaderboard(organizationId, page, limit),
    enabled: !!organizationId,
  });
}

export function useWeeklyLeaderboard(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.leaderboard.weekly(page, limit),
    queryFn: () => leaderboardService.getWeeklyLeaderboard(page, limit),
  });
}

// Infinite scroll variants

export function useInfiniteGlobalLeaderboard(limit = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.leaderboard.globalInfinite(limit),
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getGlobalLeaderboard(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: getNextPageParamFromPagination,
  });
}

export function useInfiniteOrganizationLeaderboard(organizationId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.leaderboard.organizationInfinite(organizationId, limit),
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getOrganizationLeaderboard(organizationId, pageParam, limit),
    initialPageParam: 1,
    enabled: !!organizationId,
    getNextPageParam: getNextPageParamFromPagination,
  });
}

export function useInfiniteWeeklyLeaderboard(limit = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.leaderboard.weeklyInfinite(limit),
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getWeeklyLeaderboard(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: getNextPageParamFromPagination,
  });
}
