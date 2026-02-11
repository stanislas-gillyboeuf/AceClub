import { apiClient } from "../client";
import type { User, UserPreferences, UpdateProfileData, SearchUserResult } from "@/types/user";

export const userApi = {
  async getMe(): Promise<User> {
    return apiClient.get("user/me").json<User>();
  },

  async getPreferences(): Promise<UserPreferences> {
    return apiClient.get("user/preferences").json<UserPreferences>();
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiClient.put("user/profile", { json: data }).json<User>();
  },

  async completeOnboarding(data: {
    sport: string;
    skillLevel: string;
    organizationId: string;
    phoneNumber: string;
    imageUrl?: string;
    pin?: string;
  }): Promise<User> {
    return apiClient
      .post("user/complete-onboarding", { json: data })
      .json<User>();
  },

  async searchUsers(
    query: string,
    limit?: number
  ): Promise<{ users: SearchUserResult[]; count: number }> {
    return apiClient
      .get("user/search", {
        searchParams: { query, ...(limit ? { limit: String(limit) } : {}) },
      })
      .json<{ users: SearchUserResult[]; count: number }>();
  },

  async createGhost(data: {
    name: string;
    email: string;
  }): Promise<{ id: string; name: string; email: string; image: string | null; isGhost: boolean; createdAt: string }> {
    return apiClient
      .post("user/ghost", { json: data })
      .json();
  },
};
