import { apiClient } from "../client";
import type { Badge, TitlesResponse } from "@/types/reward";

export const rewardApi = {
  async getMyBadges(): Promise<{ badges: Badge[] }> {
    return apiClient.get("reward/badges").json<{ badges: Badge[] }>();
  },

  async getAllBadges(): Promise<{ badges: Badge[] }> {
    return apiClient.get("reward/badges/all").json<{ badges: Badge[] }>();
  },

  async getTitles(): Promise<TitlesResponse> {
    return apiClient.get("reward/titles").json<TitlesResponse>();
  },

  async equipTitle(titleId: string): Promise<{ success: boolean; titleId: string }> {
    return apiClient
      .put("reward/titles/equip", { json: { titleId } })
      .json<{ success: boolean; titleId: string }>();
  },
};
