export type ChallengeType = "quantitative" | "social" | "performance";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type ChallengeStatus = "active" | "completed" | "expired";

export interface Challenge {
  id: string;
  code: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  title: string;
  description: string;
  currentProgress: number;
  targetValue: number;
  acesReward: number;
  status: ChallengeStatus;
  expiresAt: string;
}
