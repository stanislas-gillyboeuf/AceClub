export const LEVEL_CONFIG = {
  BASE_XP: 100,
  GROWTH_RATE: 1.15,
  MAX_LEVEL: 100,
} as const;

export const XP_REWARDS = {
  MATCH_PARTICIPATION: 100,
  MATCH_VICTORY: 300,
  CHALLENGE_BASE: 150,
} as const;

export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.GROWTH_RATE, level - 2));
}

export function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXpRequiredForLevel(i);
  }
  return total;
}

export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
}

export function calculateLevelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remainingXp = totalXp;

  while (level < LEVEL_CONFIG.MAX_LEVEL) {
    const xpNeeded = getXpRequiredForLevel(level + 1);
    if (remainingXp < xpNeeded) {
      return {
        level,
        currentLevelXp: remainingXp,
        xpToNextLevel: xpNeeded - remainingXp,
        progressPercent: xpNeeded > 0 ? (remainingXp / xpNeeded) * 100 : 0,
      };
    }
    remainingXp -= xpNeeded;
    level++;
  }

  return {
    level: LEVEL_CONFIG.MAX_LEVEL,
    currentLevelXp: 0,
    xpToNextLevel: 0,
    progressPercent: 100,
  };
}
