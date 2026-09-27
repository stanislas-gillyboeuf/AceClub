import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { leaderboardService } from "@/services/leaderboard";
import { queryKeys } from "@/lib/query-keys";
import { getNextPageParamFromPagination } from "@/hooks/use-infinite-pagination";

/** Without `organizationId`, reserved to platform super-admins server-side. */
export function useGlobalLeaderboard(page = 1, limit = 20, organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard.global(page, limit, organizationId),
    queryFn: () => leaderboardService.getGlobalLeaderboard(page, limit, organizationId),
  });
}

export function useOrganizationLeaderboard(organizationId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.leaderboard.organization(organizationId, page, limit),
    queryFn: () => leaderboardService.getOrganizationLeaderboard(organizationId, page, limit),
    enabled: !!organizationId,
  });
}

/** Without `organizationId`, reserved to platform super-admins server-side. */
export function useWeeklyLeaderboard(page = 1, limit = 20, organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard.weekly(page, limit, organizationId),
    queryFn: () => leaderboardService.getWeeklyLeaderboard(page, limit, organizationId),
  });
}

// Infinite scroll variants

/** Without `organizationId`, reserved to platform super-admins server-side. */
export function useInfiniteGlobalLeaderboard(limit = 20, organizationId?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.leaderboard.globalInfinite(limit, organizationId),
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getGlobalLeaderboard(pageParam, limit, organizationId),
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

/** The club's weekly aces leaderboard — requires membership in `organizationId`. */
export function useInfiniteWeeklyLeaderboard(organizationId?: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.leaderboard.weeklyInfinite(limit, organizationId),
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getWeeklyLeaderboard(pageParam, limit, organizationId),
    initialPageParam: 1,
    enabled: !!organizationId,
    getNextPageParam: getNextPageParamFromPagination,
  });
}
