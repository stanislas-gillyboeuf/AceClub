import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userStreak } from "../../../db/schema/streak/schema";
import { getStreakMultiplier } from "../../../lib/game-config-service";

export const getMyStreak = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const [streak] = await db
    .select()
    .from(userStreak)
    .where(eq(userStreak.userId, authUser!.id))
    .limit(1);

  if (!streak) {
    return c.json({
      currentStreak: 0,
      longestStreak: 0,
      multiplier: 1.0,
      totalActiveWeeks: 0,
    });
  }

  return c.json({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    multiplier: await getStreakMultiplier(streak.currentStreak),
    totalActiveWeeks: streak.totalActiveWeeks,
    streakStartDate: streak.streakStartDate,
  });
};
