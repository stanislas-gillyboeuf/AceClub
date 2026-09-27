import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userLevel } from "../../../db/schema/level/schema";
import { calculateLevelFromAces } from "../services/xp-calculator";
import { isSuperAdmin, notFound } from "../../../lib/club-access";
import { canViewPlayerHistory } from "../../match/lib/feed-scope";
import { relationBetween } from "../../match/lib/visibility";

export const getUserLevel = async (c: Context<HonoContext>) => {
  const userId = c.req.param("userId");
  const currentUser = c.get("user")!;

  // Someone else's level: yourself, a co-participant of one of your matches, or a club mate.
  if (userId !== currentUser.id && !isSuperAdmin(currentUser)) {
    const relation = await relationBetween(currentUser.id, userId);
    const allowed = canViewPlayerHistory({
      viewerId: currentUser.id,
      targetId: userId,
      isSuperAdmin: false,
      ...relation,
    });
    if (!allowed) return notFound(c);
  }

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
