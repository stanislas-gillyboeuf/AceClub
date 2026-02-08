import { eq, and, sql } from "drizzle-orm";
import { db } from "../../../db";
import { badge, userBadge } from "../../../db/schema/reward/schema";
import { userLevel, acesTransaction } from "../../../db/schema/level/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { userChallenge } from "../../../db/schema/challenge/schema";
import { calculateLevelFromAces } from "../../level/services/xp-calculator";

async function hasUserBadge(userId: string, badgeCode: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(userBadge)
    .innerJoin(badge, eq(userBadge.badgeId, badge.id))
    .where(and(eq(userBadge.userId, userId), eq(badge.code, badgeCode)))
    .limit(1);
  return !!existing;
}

async function awardBadge(userId: string, badgeCode: string): Promise<void> {
  const [badgeRecord] = await db.select().from(badge).where(eq(badge.code, badgeCode)).limit(1);

  if (!badgeRecord) return;

  const hasIt = await hasUserBadge(userId, badgeCode);
  if (hasIt) return;

  await db.insert(userBadge).values({
    userId,
    badgeId: badgeRecord.id,
  });
}

export async function checkBadges(userId: string): Promise<void> {
  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, userId))
    .limit(1);

  if (levelData) {
    const levelInfo = calculateLevelFromAces(levelData.totalAces);

    if (levelInfo.level >= 5) await awardBadge(userId, "LEVEL_5");
    if (levelInfo.level >= 10) await awardBadge(userId, "LEVEL_10");
    if (levelInfo.level >= 25) await awardBadge(userId, "LEVEL_25");
    if (levelInfo.level >= 50) await awardBadge(userId, "LEVEL_50");
    if (levelInfo.level >= 75) await awardBadge(userId, "LEVEL_75");
    if (levelInfo.level >= 100) await awardBadge(userId, "LEVEL_100");
  }

  const [streakData] = await db
    .select()
    .from(userStreak)
    .where(eq(userStreak.userId, userId))
    .limit(1);

  if (streakData) {
    if (streakData.longestStreak >= 4) await awardBadge(userId, "STREAK_4");
    if (streakData.longestStreak >= 12) await awardBadge(userId, "STREAK_12");
  }

  const [matchStats] = await db
    .select({
      totalMatches: sql<number>`count(*)`.as("total_matches"),
      totalWins: sql<number>`sum(case when ${matchParticipant.isWinner} then 1 else 0 end)`.as(
        "total_wins",
      ),
    })
    .from(matchParticipant)
    .innerJoin(match, eq(matchParticipant.matchId, match.id))
    .where(and(eq(matchParticipant.userId, userId), eq(match.status, "finished")));

  if (matchStats) {
    const totalMatches = Number(matchStats.totalMatches) || 0;
    const totalWins = Number(matchStats.totalWins) || 0;

    if (totalWins >= 1) await awardBadge(userId, "FIRST_WIN");
    if (totalWins >= 10) await awardBadge(userId, "WIN_10");
    if (totalWins >= 50) await awardBadge(userId, "WIN_50");
    if (totalWins >= 100) await awardBadge(userId, "WIN_100");

    if (totalMatches >= 10) await awardBadge(userId, "MATCH_10");
    if (totalMatches >= 50) await awardBadge(userId, "MATCH_50");
    if (totalMatches >= 100) await awardBadge(userId, "MATCH_100");
  }

  const [challengeStats] = await db
    .select({
      completedCount: sql<number>`count(*)`.as("completed_count"),
    })
    .from(userChallenge)
    .where(and(eq(userChallenge.userId, userId), eq(userChallenge.status, "completed")));

  if (challengeStats) {
    const completedCount = Number(challengeStats.completedCount) || 0;

    if (completedCount >= 10) await awardBadge(userId, "CHALLENGE_10");
    if (completedCount >= 50) await awardBadge(userId, "CHALLENGE_50");
  }
}
