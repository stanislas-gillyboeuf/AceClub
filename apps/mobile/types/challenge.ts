export type ChallengeType = "weekly" | "monthly" | "special";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type ChallengeStatus = "active" | "completed" | "expired";

export interface Challenge {
  id: string;
  code: string;
  type: string;
  difficulty: string;
  status: string;
  title: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  acesReward: number;
  expiresAt: string;
}

export interface ChallengesResponse {
  challenges: Challenge[];
}

export interface ChallengeTemplate {
  id: string;
  type: string;
  difficulty: string;
  title: string;
  description: string;
  targetValue: number;
  reward: number;
}
