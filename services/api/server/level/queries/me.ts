import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromXp } from "../services/xp-calculator";

export const getMyLevel = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, authUser!.id))
    .limit(1);

  const totalXp = levelData?.totalXp ?? 0;
  const levelInfo = calculateLevelFromXp(totalXp);

  return c.json({
    totalXp,
    level: levelInfo.level,
    currentLevelXp: levelInfo.currentLevelXp,
    xpToNextLevel: levelInfo.xpToNextLevel,
    progressPercent: levelInfo.progressPercent,
  });
};
