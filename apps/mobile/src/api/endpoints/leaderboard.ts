import { apiClient } from "../client";
import type { LeaderboardResponse, WeeklyLeaderboardResponse } from "@/types/leaderboard";

export const leaderboardApi = {
  async getGlobal(params?: {
    page?: number;
    limit?: number;
  }): Promise<LeaderboardResponse> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);
    return apiClient
      .get("leaderboard/global", { searchParams })
      .json<LeaderboardResponse>();
  },

  async getOrganization(
    orgId: string,
    params?: { page?: number; limit?: number }
  ): Promise<LeaderboardResponse> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);
    return apiClient
      .get(`leaderboard/organization/${orgId}`, { searchParams })
      .json<LeaderboardResponse>();
  },

  async getWeekly(params?: {
    page?: number;
    limit?: number;
  }): Promise<WeeklyLeaderboardResponse> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);
    return apiClient
      .get("leaderboard/weekly", { searchParams })
      .json<WeeklyLeaderboardResponse>();
  },
};
