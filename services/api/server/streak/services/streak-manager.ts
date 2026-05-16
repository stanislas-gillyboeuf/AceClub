import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { userStreak } from "../../../db/schema/streak/schema";
import { getStreakMultiplier as getStreakMultiplierFromConfig } from "../../../lib/game-config-service";
import { getISOWeekInfo } from "../../challenge/services/challenge-selector";

function calculateWeeksDifference(
  prev: { week: number; year: number },
  curr: { week: number; year: number },
): number {
  if (prev.year === curr.year) {
    return curr.week - prev.week;
  }
  const weeksInPrevYear = 52;
  return weeksInPrevYear - prev.week + curr.week + (curr.year - prev.year - 1) * 52;
}

export interface UpdateStreakResult {
  newStreak: number;
  streakBroken: boolean;
  multiplier: number;
}

export async function updateUserStreak(
  userId: string,
  matchDate: Date,
): Promise<UpdateStreakResult> {
  const weekInfo = getISOWeekInfo(matchDate);
  const currentWeek = weekInfo.week;
  const currentYear = weekInfo.year;

  const [streak] = await db.select().from(userStreak).where(eq(userStreak.userId, userId)).limit(1);

  if (!streak) {
    await db.insert(userStreak).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveWeek: currentWeek,
      lastActiveYear: currentYear,
      streakStartDate: matchDate,
      totalActiveWeeks: 1,
    });

    return { newStreak: 1, streakBroken: false, multiplier: 1.0 };
  }

  if (streak.lastActiveWeek === currentWeek && streak.lastActiveYear === currentYear) {
    const multiplier = await getStreakMultiplierFromConfig(streak.currentStreak);
    return {
      newStreak: streak.currentStreak,
      streakBroken: false,
      multiplier,
    };
  }

  const weeksDiff = calculateWeeksDifference(
    { week: streak.lastActiveWeek!, year: streak.lastActiveYear! },
    { week: currentWeek, year: currentYear },
  );

  let newStreak: number;
  let streakBroken = false;

  if (weeksDiff === 1) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
    streakBroken = true;
  }

  await db
    .update(userStreak)
    .set({
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastActiveWeek: currentWeek,
      lastActiveYear: currentYear,
      streakStartDate: streakBroken ? matchDate : streak.streakStartDate,
      totalActiveWeeks: streak.totalActiveWeeks + 1,
    })
    .where(eq(userStreak.userId, userId));

  const multiplier = await getStreakMultiplierFromConfig(newStreak);

  return {
    newStreak,
    streakBroken,
    multiplier,
  };
}
