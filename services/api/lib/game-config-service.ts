import { db } from "../db";
import { gameConfig } from "../db/schema/game-config/schema";
import { cached, cacheDel, CacheKeys, CacheTTL } from "./cache";

// Fallback defaults (current hardcoded values)
const DEFAULTS = {
  aces_rewards: {
    MATCH_PARTICIPATION: "100",
    MATCH_VICTORY: "300",
    CHALLENGE_BASE: "150",
  },
  level_formula: {
    BASE_ACES: "100",
    GROWTH_RATE: "1.15",
    MAX_LEVEL: "100",
  },
  streak_multiplier: {
    week_1: "1.0",
    week_2: "1.1",
    week_3_4: "1.2",
    week_5_7: "1.3",
    week_8_11: "1.5",
    week_12_plus: "2.0",
  },
} as const;

export type GameConfigMap = Record<string, Record<string, string>>;

async function loadAllConfig(): Promise<GameConfigMap> {
  return cached<GameConfigMap>(CacheKeys.gameConfig(), CacheTTL.LONG, async () => {
    const rows = await db.select().from(gameConfig);
    const map: GameConfigMap = {};
    for (const row of rows) {
      if (!map[row.category]) map[row.category] = {};
      map[row.category][row.key] = row.value;
    }
    return map;
  });
}

function getVal(config: GameConfigMap, category: string, key: string): string {
  return config[category]?.[key] ?? (DEFAULTS as Record<string, Record<string, string>>)[category]?.[key] ?? "0";
}

export async function getAcesRewards() {
  const config = await loadAllConfig();
  return {
    MATCH_PARTICIPATION: parseInt(getVal(config, "aces_rewards", "MATCH_PARTICIPATION"), 10),
    MATCH_VICTORY: parseInt(getVal(config, "aces_rewards", "MATCH_VICTORY"), 10),
    CHALLENGE_BASE: parseInt(getVal(config, "aces_rewards", "CHALLENGE_BASE"), 10),
  };
}

export async function getLevelConfig() {
  const config = await loadAllConfig();
  return {
    BASE_ACES: parseInt(getVal(config, "level_formula", "BASE_ACES"), 10),
    GROWTH_RATE: parseFloat(getVal(config, "level_formula", "GROWTH_RATE")),
    MAX_LEVEL: parseInt(getVal(config, "level_formula", "MAX_LEVEL"), 10),
  };
}

export async function getStreakMultiplier(currentStreak: number): Promise<number> {
  const config = await loadAllConfig();
  const cat = config["streak_multiplier"] ?? DEFAULTS.streak_multiplier;

  if (currentStreak >= 12) return parseFloat(cat["week_12_plus"] ?? "2.0");
  if (currentStreak >= 8) return parseFloat(cat["week_8_11"] ?? "1.5");
  if (currentStreak >= 5) return parseFloat(cat["week_5_7"] ?? "1.3");
  if (currentStreak >= 3) return parseFloat(cat["week_3_4"] ?? "1.2");
  if (currentStreak === 2) return parseFloat(cat["week_2"] ?? "1.1");
  return parseFloat(cat["week_1"] ?? "1.0");
}

export async function invalidateGameConfigCache(): Promise<void> {
  await cacheDel(CacheKeys.gameConfig());
}

export { DEFAULTS as GAME_CONFIG_DEFAULTS };
