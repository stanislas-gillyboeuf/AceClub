import type { Pagination } from "./common";

export type AcesTransactionType = "match_win" | "match_loss" | "match_played" | "streak_bonus" | "challenge_completed" | "badge_unlocked";

export interface UserLevel {
  level: number;
  totalAces: number;
  currentLevelAces: number;
  acesToNextLevel: number;
  progressPercent: number;
}

export interface AcesTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description?: string | null;
  matchId?: string | null;
  createdAt: string;
}

export interface AcesHistoryResponse {
  transactions: AcesTransaction[];
  pagination: Pagination;
}
