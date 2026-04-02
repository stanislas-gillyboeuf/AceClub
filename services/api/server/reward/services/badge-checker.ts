import { eq, and, sql } from "drizzle-orm";
import { db } from "../../../db";
import { badge, userBadge } from "../../../db/schema/reward/schema";
import { userLevel } from "../../../db/schema/level/schema";
import { userStreak } from "../../../db/schema/streak/schema";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { userChallenge } from "../../../db/schema/challenge/schema";
import { calculateLevelFromAcesAsync } from "../../level/services/xp-calculator";

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
  const [badgeRecord] = await db
    .select()
    .from(badge)
    .where(and(eq(badge.code, badgeCode), eq(badge.isActive, true)))
    .limit(1);

  if (!badgeRecord) return;

  const hasIt = await hasUserBadge(userId, badgeCode);
  if (hasIt) return;

  await db.insert(userBadge).values({
    userId,
    badgeId: badgeRecord.id,
  });
}

function extractThreshold(code: string): number | null {
  const match = code.match(/_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export async function checkBadges(userId: string): Promise<void> {
  // Load all active badges from DB
  const activeBadges = await db
    .select()
    .from(badge)
    .where(eq(badge.isActive, true));

  // Level-based badges (LEVEL_*)
  const levelBadges = activeBadges.filter((b) => b.code.startsWith("LEVEL_"));
  if (levelBadges.length > 0) {
    const [levelData] = await db
      .select()
      .from(userLevel)
      .where(eq(userLevel.userId, userId))
      .limit(1);

    if (levelData) {
      const levelInfo = await calculateLevelFromAcesAsync(levelData.totalAces);
      for (const b of levelBadges) {
        const threshold = extractThreshold(b.code);
        if (threshold && levelInfo.level >= threshold) {
          await awardBadge(userId, b.code);
        }
      }
    }
  }

  // Streak-based badges (STREAK_*)
  const streakBadges = activeBadges.filter((b) => b.code.startsWith("STREAK_"));
  if (streakBadges.length > 0) {
    const [streakData] = await db
      .select()
      .from(userStreak)
      .where(eq(userStreak.userId, userId))
      .limit(1);

    if (streakData) {
      for (const b of streakBadges) {
        const threshold = extractThreshold(b.code);
        if (threshold && streakData.longestStreak >= threshold) {
          await awardBadge(userId, b.code);
        }
      }
    }
  }

  // Match-based badges (WIN_*, MATCH_*, FIRST_WIN)
  const winBadges = activeBadges.filter((b) => b.code.startsWith("WIN_") || b.code === "FIRST_WIN");
  const matchBadges = activeBadges.filter((b) => b.code.startsWith("MATCH_"));

  if (winBadges.length > 0 || matchBadges.length > 0) {
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

      // FIRST_WIN special case
      if (totalWins >= 1) {
        const firstWin = activeBadges.find((b) => b.code === "FIRST_WIN");
        if (firstWin) await awardBadge(userId, "FIRST_WIN");
      }

      for (const b of winBadges) {
        if (b.code === "FIRST_WIN") continue;
        const threshold = extractThreshold(b.code);
        if (threshold && totalWins >= threshold) {
          await awardBadge(userId, b.code);
        }
      }

      for (const b of matchBadges) {
        const threshold = extractThreshold(b.code);
        if (threshold && totalMatches >= threshold) {
          await awardBadge(userId, b.code);
        }
      }
    }
  }

  // Challenge-based badges (CHALLENGE_*)
  const challengeBadges = activeBadges.filter((b) => b.code.startsWith("CHALLENGE_"));
  if (challengeBadges.length > 0) {
    const [challengeStats] = await db
      .select({
        completedCount: sql<number>`count(*)`.as("completed_count"),
      })
      .from(userChallenge)
      .where(and(eq(userChallenge.userId, userId), eq(userChallenge.status, "completed")));

    if (challengeStats) {
      const completedCount = Number(challengeStats.completedCount) || 0;

      for (const b of challengeBadges) {
        const threshold = extractThreshold(b.code);
        if (threshold && completedCount >= threshold) {
          await awardBadge(userId, b.code);
        }
      }
    }
  }
}
