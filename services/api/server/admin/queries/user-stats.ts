import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  userLevel,
  acesTransaction,
  userStreak,
  matchParticipant,
  match,
  userBadge,
  badge,
  userChallenge,
  challengeTemplate,
} from "../../../db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export const userStats = async (c: Context<HonoContext>) => {
  const userId = c.req.param("userId");

  if (!userId) {
    return c.json({ error: "BadRequest", message: "userId is required" }, 400);
  }

  // Run all queries in parallel
  const [
    levelData,
    streakData,
    matchesData,
    badgesData,
    acesHistory,
    challengesData,
  ] = await Promise.all([
    // User level
    db
      .select()
      .from(userLevel)
      .where(eq(userLevel.userId, userId))
      .limit(1),

    // User streak
    db
      .select()
      .from(userStreak)
      .where(eq(userStreak.userId, userId))
      .limit(1),

    // Matches with participant data
    db
      .select({
        matchId: match.id,
        status: match.status,
        type: match.type,
        finishedAt: match.finishedAt,
        scheduledAt: match.scheduledAt,
        isWinner: matchParticipant.isWinner,
        side: matchParticipant.side,
      })
      .from(matchParticipant)
      .innerJoin(match, eq(matchParticipant.matchId, match.id))
      .where(eq(matchParticipant.userId, userId))
      .orderBy(desc(match.createdAt))
      .limit(50),

    // Badges
    db
      .select({
        badgeId: badge.id,
        code: badge.code,
        category: badge.category,
        nameFr: badge.nameFr,
        nameEn: badge.nameEn,
        descriptionFr: badge.descriptionFr,
        descriptionEn: badge.descriptionEn,
        imageUrl: badge.imageUrl,
        unlockedAt: userBadge.unlockedAt,
      })
      .from(userBadge)
      .innerJoin(badge, eq(userBadge.badgeId, badge.id))
      .where(eq(userBadge.userId, userId))
      .orderBy(desc(userBadge.unlockedAt)),

    // Aces history (last 30 days, grouped by day)
    db
      .select({
        date: sql<string>`DATE(${acesTransaction.createdAt})`.as("date"),
        total: sql<number>`SUM(${acesTransaction.amount})`.as("total"),
      })
      .from(acesTransaction)
      .where(
        and(
          eq(acesTransaction.userId, userId),
          gte(
            acesTransaction.createdAt,
            sql`NOW() - INTERVAL '30 days'`,
          ),
        ),
      )
      .groupBy(sql`DATE(${acesTransaction.createdAt})`)
      .orderBy(sql`DATE(${acesTransaction.createdAt})`),

    // Challenges
    db
      .select({
        challengeId: userChallenge.id,
        status: userChallenge.status,
        currentProgress: userChallenge.currentProgress,
        targetValue: userChallenge.targetValue,
        completedAt: userChallenge.completedAt,
        acesAwarded: userChallenge.acesAwarded,
        weekNumber: userChallenge.weekNumber,
        year: userChallenge.year,
        templateCode: challengeTemplate.code,
        templateTitleFr: challengeTemplate.titleFr,
        templateTitleEn: challengeTemplate.titleEn,
        templateDifficulty: challengeTemplate.difficulty,
        templateType: challengeTemplate.type,
      })
      .from(userChallenge)
      .innerJoin(
        challengeTemplate,
        eq(userChallenge.templateId, challengeTemplate.id),
      )
      .where(eq(userChallenge.userId, userId))
      .orderBy(desc(userChallenge.createdAt))
      .limit(20),
  ]);

  // Compute match stats
  const finishedMatches = matchesData.filter((m) => m.status === "finished");
  const wins = finishedMatches.filter((m) => m.isWinner).length;
  const losses = finishedMatches.length - wins;

  const level = levelData[0] ?? null;
  const streak = streakData[0] ?? null;

  return c.json({
    level: level
      ? { totalAces: level.totalAces, currentLevel: level.currentLevel }
      : { totalAces: 0, currentLevel: 1 },
    streak: streak
      ? {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          totalActiveWeeks: streak.totalActiveWeeks,
        }
      : { currentStreak: 0, longestStreak: 0, totalActiveWeeks: 0 },
    matches: {
      total: finishedMatches.length,
      wins,
      losses,
      winRate: finishedMatches.length > 0
        ? Math.round((wins / finishedMatches.length) * 100)
        : 0,
      recent: matchesData.slice(0, 10).map((m) => ({
        matchId: m.matchId,
        status: m.status,
        finishedAt: m.finishedAt,
        scheduledAt: m.scheduledAt,
        isWinner: m.isWinner,
        side: m.side,
      })),
    },
    badges: badgesData,
    acesHistory,
    challenges: {
      active: challengesData.filter((c) => c.status === "active"),
      completed: challengesData.filter((c) => c.status === "completed"),
    },
  });
};
