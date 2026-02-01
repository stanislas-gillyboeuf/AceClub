import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromAces } from "../services/xp-calculator";

export const getMyLevel = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, authUser!.id))
    .limit(1);

  const totalAces = levelData?.totalAces ?? 0;
  const levelInfo = calculateLevelFromAces(totalAces);

  return c.json({
    totalAces,
    level: levelInfo.level,
    currentLevelAces: levelInfo.currentLevelAces,
    acesToNextLevel: levelInfo.acesToNextLevel,
    progressPercent: levelInfo.progressPercent,
  });
};
