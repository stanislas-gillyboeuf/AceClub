export type ChallengeType = "weekly" | "monthly" | "special";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type ChallengeStatus = "active" | "completed" | "expired";

export interface Challenge {
  id: string;
  templateId: string;
  userId: string;
  type: string;
  difficulty: string;
  status: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  reward: number;
  startDate: string;
  endDate: string;
  completedAt?: string | null;
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
