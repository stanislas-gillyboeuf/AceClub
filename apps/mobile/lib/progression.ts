// Level tier system matching Swift LevelTier
export type LevelTierName = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface LevelTier {
  name: LevelTierName;
  displayName: string;
  color: string;
}

const TIERS: Record<LevelTierName, LevelTier> = {
  bronze: { name: "bronze", displayName: "Bronze", color: "#CD7F32" },
  silver: { name: "silver", displayName: "Argent", color: "#C0C0C0" },
  gold: { name: "gold", displayName: "Or", color: "#FFD700" },
  platinum: { name: "platinum", displayName: "Platine", color: "#E5E4E2" },
  diamond: { name: "diamond", displayName: "Diamant", color: "#B9F2FF" },
};

export function getLevelTier(level: number): LevelTier {
  if (level >= 75) return TIERS.diamond;
  if (level >= 51) return TIERS.platinum;
  if (level >= 26) return TIERS.gold;
  if (level >= 11) return TIERS.silver;
  return TIERS.bronze;
}

export function isMaxLevel(level: number): boolean {
  return level >= 100;
}

// Streak helpers
export function getStreakColor(streak: number): string {
  if (streak === 0) return "#8E8E93"; // gray
  if (streak <= 3) return "#FF9500"; // orange
  if (streak <= 7) return "#FF3B30"; // red
  return "#AF52DE"; // purple
}

export function formatStreakWeeks(streak: number): string {
  if (streak === 0) return "0 semaine";
  if (streak === 1) return "1 semaine";
  return `${streak} semaines`;
}

export function formatMultiplier(multiplier: number): string | null {
  if (multiplier <= 1.0) return null;
  return `x${multiplier % 1 === 0 ? multiplier.toFixed(0) : multiplier.toFixed(1)}`;
}

// Challenge helpers
export function getChallengeTimeRemaining(expiresAt: string): string | null {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return null;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}j restant${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `${diffHours}h restante${diffHours > 1 ? "s" : ""}`;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes}min`;
}

export function getChallengeProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(current / target, 1);
}

export function getChallengeStatusColor(status: string, accentColor: string): string {
  switch (status) {
    case "completed":
      return "#34C759";
    case "expired":
      return "#8E8E93";
    default:
      return accentColor;
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "#34C759";
    case "medium":
      return "#FF9500";
    case "hard":
      return "#FF3B30";
    default:
      return "#8E8E93";
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "Facile";
    case "medium":
      return "Moyen";
    case "hard":
      return "Difficile";
    default:
      return difficulty;
  }
}

// Badge helpers
export function getBadgeCategoryColor(category: string): string {
  switch (category) {
    case "level":
      return "#007AFF";
    case "achievement":
      return "#34C759";
    case "milestone":
      return "#FF9500";
    case "special":
      return "#AF52DE";
    default:
      return "#8E8E93";
  }
}

export function getBadgeCategoryLabel(category: string): string {
  switch (category) {
    case "level":
      return "Niveau";
    case "achievement":
      return "Réussite";
    case "milestone":
      return "Étape";
    case "special":
      return "Spécial";
    default:
      return category;
  }
}

// Rank helpers
export function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return "#FFD700"; // gold
    case 2:
      return "#C0C0C0"; // silver
    case 3:
      return "#CD7F32"; // bronze
    default:
      return "#8E8E93";
  }
}

export function isTopRank(rank: number): boolean {
  return rank >= 1 && rank <= 3;
}

// Week label for weekly leaderboard
export function formatWeekLabel(weekStartDate?: string): string {
  if (!weekStartDate) return "Cette semaine";
  const date = new Date(weekStartDate);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  });
  return `Semaine du ${formatter.format(date)}`;
}
