import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromXp } from "../services/xp-calculator";

export const getUserLevel = async (c: Context<HonoContext>) => {
  const userId = c.req.param("userId");

  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, userId))
    .limit(1);

  if (!levelData) {
    return c.json({
      totalXp: 0,
      level: 1,
      currentLevelXp: 0,
      xpToNextLevel: 100,
      progressPercent: 0,
    });
  }

  const levelInfo = calculateLevelFromXp(levelData.totalXp);

  return c.json({
    totalXp: levelData.totalXp,
    level: levelInfo.level,
    currentLevelXp: levelInfo.currentLevelXp,
    xpToNextLevel: levelInfo.xpToNextLevel,
    progressPercent: levelInfo.progressPercent,
  });
};
