export const LEVEL_CONFIG = {
  BASE_ACES: 100,
  GROWTH_RATE: 1.15,
  MAX_LEVEL: 100,
} as const;

export const ACES_REWARDS = {
  MATCH_PARTICIPATION: 100,
  MATCH_VICTORY: 300,
  CHALLENGE_BASE: 150,
} as const;

export function getAcesRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(LEVEL_CONFIG.BASE_ACES * Math.pow(LEVEL_CONFIG.GROWTH_RATE, level - 2));
}

export function getTotalAcesForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getAcesRequiredForLevel(i);
  }
  return total;
}

export interface LevelInfo {
  level: number;
  currentLevelAces: number;
  acesToNextLevel: number;
  progressPercent: number;
}

export function calculateLevelFromAces(totalAces: number): LevelInfo {
  let level = 1;
  let remainingAces = totalAces;

  while (level < LEVEL_CONFIG.MAX_LEVEL) {
    const acesNeeded = getAcesRequiredForLevel(level + 1);
    if (remainingAces < acesNeeded) {
      return {
        level,
        currentLevelAces: remainingAces,
        acesToNextLevel: acesNeeded - remainingAces,
        progressPercent: acesNeeded > 0 ? (remainingAces / acesNeeded) * 100 : 0,
      };
    }
    remainingAces -= acesNeeded;
    level++;
  }

  return {
    level: LEVEL_CONFIG.MAX_LEVEL,
    currentLevelAces: 0,
    acesToNextLevel: 0,
    progressPercent: 100,
  };
}
