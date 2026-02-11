import { apiClient } from "../client";
import type { Challenge } from "@/types/challenge";

export const challengeApi = {
  async getMyChallenges(): Promise<{ challenges: Challenge[] }> {
    return apiClient.get("challenge").json<{ challenges: Challenge[] }>();
  },
};
