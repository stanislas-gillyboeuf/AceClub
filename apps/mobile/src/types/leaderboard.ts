import type { UserSummary } from "./user";

export interface LeaderboardEntry {
  rank: number;
  user: UserSummary;
  aces: number;
  level: number;
  streak: number;
}

export interface LeaderboardPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: LeaderboardPagination;
}

export interface WeeklyLeaderboardEntry {
  rank: number;
  user: UserSummary;
  weeklyAces: number;
}

export interface WeeklyLeaderboardResponse {
  leaderboard: WeeklyLeaderboardEntry[];
  pagination: LeaderboardPagination;
  weekStartDate: string;
}
