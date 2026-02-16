import type { Pagination } from "./common";

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  aces: number;
  level: number;
  streak: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: Pagination;
}

export interface WeeklyLeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  weeklyAces: number;
  matchesPlayed: number;
}

export interface WeeklyLeaderboardResponse {
  leaderboard: WeeklyLeaderboardEntry[];
  pagination: Pagination;
}
