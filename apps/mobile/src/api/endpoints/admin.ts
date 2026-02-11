import { apiClient } from "../client";
import type { User } from "@/types/user";
import type { Session } from "@/types/auth";

export interface AdminListUsersParams {
  searchValue?: string;
  searchField?: "email" | "name";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface AdminUserStats {
  level: { totalAces: number; currentLevel: number };
  streak: { currentStreak: number; longestStreak: number; totalActiveWeeks: number };
  matches: {
    total: number;
    wins: number;
    losses: number;
    winRate: number;
    recent: Array<{
      matchId: string;
      status: string;
      finishedAt: string | null;
      scheduledAt: string | null;
      isWinner: boolean | null;
      side: string;
    }>;
  };
  badges: Array<{
    badgeId: string;
    code: string;
    category: string;
    nameFr: string;
    imageUrl: string | null;
    unlockedAt: string;
  }>;
  acesHistory: Array<{ date: string; total: number }>;
  challenges: {
    active: Array<{ challengeId: string; status: string; currentProgress: number; targetValue: number }>;
    completed: Array<{ challengeId: string; status: string; completedAt: string | null; acesAwarded: number | null }>;
  };
}

export const adminApi = {
  async listUsers(params?: AdminListUsersParams): Promise<{ users: User[]; total: number }> {
    const searchParams: Record<string, string | number> = {};
    if (params?.searchValue) searchParams.searchValue = params.searchValue;
    if (params?.searchField) searchParams.searchField = params.searchField;
    if (params?.searchOperator) searchParams.searchOperator = params.searchOperator;
    if (params?.limit) searchParams.limit = params.limit;
    if (params?.offset) searchParams.offset = params.offset;
    if (params?.sortBy) searchParams.sortBy = params.sortBy;
    if (params?.sortDirection) searchParams.sortDirection = params.sortDirection;
    return apiClient
      .get("admin/list-users", { searchParams })
      .json<{ users: User[]; total: number }>();
  },

  async listUserSessions(userId: string): Promise<Session[]> {
    return apiClient
      .get("admin/list-user-sessions", {
        searchParams: { userId },
      })
      .json<Session[]>();
  },

  async getUserStats(userId: string): Promise<AdminUserStats> {
    return apiClient
      .get(`admin/user-stats/${userId}`)
      .json<AdminUserStats>();
  },

  async setRole(userId: string, role: string): Promise<void> {
    await apiClient.post("admin/set-role", { json: { userId, role } });
  },

  async banUser(userId: string, banReason?: string): Promise<void> {
    await apiClient.post("admin/ban-user", { json: { userId, banReason } });
  },

  async unbanUser(userId: string): Promise<void> {
    await apiClient.post("admin/unban-user", { json: { userId } });
  },

  async revokeUserSession(sessionToken: string): Promise<void> {
    await apiClient.post("admin/revoke-user-session", {
      json: { sessionToken },
    });
  },

  async revokeUserSessions(userId: string): Promise<void> {
    await apiClient.post("admin/revoke-user-sessions", {
      json: { userId },
    });
  },

  async updateUser(
    userId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    await apiClient.put("admin/update-user", { json: { userId, data } });
  },
};
