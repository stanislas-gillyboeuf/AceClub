import { api } from "@/lib/api";
import type { LeaderboardResponse, WeeklyLeaderboardResponse } from "@/types/leaderboard";

export const leaderboardService = {
  /** Without `organizationId` this is reserved to platform super-admins (403 otherwise). */
  getGlobalLeaderboard: (page = 1, limit = 20, organizationId?: string) =>
    api.get<LeaderboardResponse>("/leaderboard/global", { page, limit, organizationId }),

  getOrganizationLeaderboard: (organizationId: string, page = 1, limit = 20) =>
    api.get<LeaderboardResponse>(`/leaderboard/organization/${organizationId}`, { page, limit }),

  /** Without `organizationId` this is reserved to platform super-admins (403 otherwise). */
  getWeeklyLeaderboard: (page = 1, limit = 20, organizationId?: string) =>
    api.get<WeeklyLeaderboardResponse>("/leaderboard/weekly", { page, limit, organizationId }),
};
