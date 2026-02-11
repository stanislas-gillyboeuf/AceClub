export interface UserLevel {
  totalAces: number;
  level: number;
  currentLevelAces: number;
  acesToNextLevel: number;
  progressPercent: number;
}

export type AcesTransactionType =
  | "match_participation"
  | "match_victory"
  | "challenge_completed"
  | "streak_bonus"
  | "level_up_bonus"
  | "badge_bonus";

export interface AcesTransaction {
  id: string;
  type: AcesTransactionType;
  amount: number;
  description: string | null;
  multiplier: number;
  createdAt: string;
}

export interface LevelTier {
  level: number;
  name: string;
  minAces: number;
  maxAces: number;
}
