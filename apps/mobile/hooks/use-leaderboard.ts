import { useQuery } from "@tanstack/react-query";
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
