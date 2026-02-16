import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { leaderboardService } from "@/services/leaderboard";

export function useGlobalLeaderboard(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["leaderboard", "global", page, limit],
    queryFn: () => leaderboardService.getGlobalLeaderboard(page, limit),
  });
}

export function useOrganizationLeaderboard(organizationId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["leaderboard", "organization", organizationId, page, limit],
    queryFn: () => leaderboardService.getOrganizationLeaderboard(organizationId, page, limit),
    enabled: !!organizationId,
  });
}

export function useWeeklyLeaderboard(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["leaderboard", "weekly", page, limit],
    queryFn: () => leaderboardService.getWeeklyLeaderboard(page, limit),
  });
}

// Infinite scroll variants

export function useInfiniteGlobalLeaderboard(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "global", "infinite", limit],
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getGlobalLeaderboard(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

export function useInfiniteOrganizationLeaderboard(organizationId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "organization", "infinite", organizationId, limit],
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getOrganizationLeaderboard(organizationId, pageParam, limit),
    initialPageParam: 1,
    enabled: !!organizationId,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

export function useInfiniteWeeklyLeaderboard(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "weekly", "infinite", limit],
    queryFn: ({ pageParam = 1 }) =>
      leaderboardService.getWeeklyLeaderboard(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}
