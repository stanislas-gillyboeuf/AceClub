export interface Level {
  userId: string;
  totalAces: number;
  currentLevel: number;
  acesForNextLevel: number;
  acesInCurrentLevel: number;
  progressPercent: number;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalActiveWeeks: number;
  lastActiveWeek: string | null;
}

export interface Badge {
  id: string;
  code: string;
  category: string;
  name: string;
  description: string;
  imageUrl: string;
  unlockedAt?: string | null;
  isUnlocked?: boolean;
  requiredLevel?: number;
}

export interface Challenge {
  challengeId: string;
  templateCode: string;
  templateTitleFr: string;
  templateTitleEn: string;
  templateDifficulty: string;
  templateType: string;
  status: "active" | "completed" | "expired";
  currentProgress: number;
  targetValue: number;
  completedAt: string | null;
  acesAwarded: number | null;
  weekNumber: number;
  year: number;
}

export interface AcesHistoryEntry {
  date: string;
  total: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  totalAces: number;
  currentLevel: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  myRank: number | null;
  total: number;
}
