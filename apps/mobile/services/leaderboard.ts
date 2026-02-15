import { api } from "@/lib/api";
import type { LeaderboardResponse, WeeklyLeaderboardResponse } from "@/types/leaderboard";

export const leaderboardService = {
  getGlobalLeaderboard: (page = 1, limit = 20) =>
    api.get<LeaderboardResponse>("/leaderboard/global", { page, limit }),

  getOrganizationLeaderboard: (organizationId: string, page = 1, limit = 20) =>
    api.get<LeaderboardResponse>("/leaderboard/organization", { organizationId, page, limit }),

  getWeeklyLeaderboard: (page = 1, limit = 20) =>
    api.get<WeeklyLeaderboardResponse>("/leaderboard/weekly", { page, limit }),
};
