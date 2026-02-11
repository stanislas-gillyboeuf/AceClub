import { apiClient } from "../client";
import type { UserLevel, AcesTransaction } from "@/types/level";

export const levelApi = {
  async getMyLevel(): Promise<UserLevel> {
    return apiClient.get("level/me").json<UserLevel>();
  },

  async getUserLevel(userId: string): Promise<UserLevel> {
    return apiClient.get(`level/user/${userId}`).json<UserLevel>();
  },

  async getHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ transactions: AcesTransaction[]; page: number; limit: number }> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);
    return apiClient
      .get("level/history", { searchParams })
      .json<{ transactions: AcesTransaction[]; page: number; limit: number }>();
  },
};
