import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { userStreak } from "../../../db/schema/streak/schema";

const STREAK_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.1,
  3: 1.2,
  4: 1.2,
  5: 1.3,
  6: 1.3,
  7: 1.3,
  8: 1.5,
  9: 1.5,
  10: 1.5,
  11: 1.5,
};

export function getStreakMultiplier(currentStreak: number): number {
  if (currentStreak >= 12) return 2.0;
  return STREAK_MULTIPLIERS[currentStreak] ?? 1.0;
}

function getISOWeekInfo(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

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
    return {
      newStreak: streak.currentStreak,
      streakBroken: false,
      multiplier: getStreakMultiplier(streak.currentStreak),
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

  return {
    newStreak,
    streakBroken,
    multiplier: getStreakMultiplier(newStreak),
  };
}
