import { apiClient } from "../client";
import type { UserStreak } from "@/types/streak";

export const streakApi = {
  async getMyStreak(): Promise<UserStreak> {
    return apiClient.get("streak/me").json<UserStreak>();
  },
};
