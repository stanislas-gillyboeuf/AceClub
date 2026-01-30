import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromAces } from "../services/xp-calculator";

export const getUserLevel = async (c: Context<HonoContext>) => {
  const userId = c.req.param("userId");

  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, userId))
    .limit(1);

  if (!levelData) {
    return c.json({
      totalAces: 0,
      level: 1,
      currentLevelAces: 0,
      acesToNextLevel: 100,
      progressPercent: 0,
    });
  }

  const levelInfo = calculateLevelFromAces(levelData.totalAces);

  return c.json({
    totalAces: levelData.totalAces,
    level: levelInfo.level,
    currentLevelAces: levelInfo.currentLevelAces,
    acesToNextLevel: levelInfo.acesToNextLevel,
    progressPercent: levelInfo.progressPercent,
  });
};
