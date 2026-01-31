import { db } from "../../../db";
import { badge, userBadge } from "../../../db/schema/reward/schema";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, gte, lt, sql, inArray } from "drizzle-orm";

/**
 * Award "premiers_pas" badge to a new user
 */
export async function awardPremiersPasBadge(userId: string): Promise<void> {
  const [premiersPassBadge] = await db
    .select({ id: badge.id })
    .from(badge)
    .where(eq(badge.code, "premiers_pas"))
    .limit(1);

  if (!premiersPassBadge) {
    console.warn("[BADGE] premiers_pas badge not found in database");
    return;
  }

  await db
    .insert(userBadge)
    .values({
      userId,
      badgeId: premiersPassBadge.id,
      unlockedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log(`[BADGE] Awarded premiers_pas to user ${userId}`);
}

/**
 * Count finished matches for a user in a given month
 */
async function countFinishedMatchesInMonth(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const startOfMonth = new Date(year, month, 1);
  const startOfNextMonth = new Date(year, month + 1, 1);

  const result = await db
    .select({ count: sql<number>`count(distinct ${match.id})` })
    .from(matchParticipant)
    .innerJoin(match, eq(matchParticipant.matchId, match.id))
    .where(
      and(
        eq(matchParticipant.userId, userId),
        eq(match.status, "finished"),
        gte(match.finishedAt, startOfMonth),
        lt(match.finishedAt, startOfNextMonth)
      )
    );

  return Number(result[0]?.count ?? 0);
}

/**
 * Update "joueur_regulier" badge for a single user
 * - Award if >= 5 matches this month
 * - Remove if < 5 matches this month
 */
export async function updateJoueurRegulierBadge(userId: string): Promise<void> {
  const now = new Date();
  const matchCount = await countFinishedMatchesInMonth(
    userId,
    now.getFullYear(),
    now.getMonth()
  );

  const [joueurRegulierBadge] = await db
    .select({ id: badge.id })
    .from(badge)
    .where(eq(badge.code, "joueur_regulier"))
    .limit(1);

  if (!joueurRegulierBadge) {
    console.warn("[BADGE] joueur_regulier badge not found in database");
    return;
  }

  const [existingBadge] = await db
    .select()
    .from(userBadge)
    .where(
      and(
        eq(userBadge.userId, userId),
        eq(userBadge.badgeId, joueurRegulierBadge.id)
      )
    )
    .limit(1);

  if (matchCount >= 5 && !existingBadge) {
    // Award badge
    await db.insert(userBadge).values({
      userId,
      badgeId: joueurRegulierBadge.id,
      unlockedAt: new Date(),
    });
    console.log(`[BADGE] Awarded joueur_regulier to user ${userId} (${matchCount} matches)`);
  } else if (matchCount < 5 && existingBadge) {
    // Remove badge
    await db
      .delete(userBadge)
      .where(
        and(
          eq(userBadge.userId, userId),
          eq(userBadge.badgeId, joueurRegulierBadge.id)
        )
      );
    console.log(`[BADGE] Removed joueur_regulier from user ${userId} (${matchCount} matches)`);
  }
}

/**
 * Update "en_forme" badge for a single user
 * Award if >= 5 matches/month for the last 3 months
 */
export async function updateEnFormeBadge(userId: string): Promise<void> {
  const now = new Date();
  const monthlyCounts: number[] = [];

  // Check last 3 months (including current)
  for (let i = 0; i < 3; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = await countFinishedMatchesInMonth(
      userId,
      targetDate.getFullYear(),
      targetDate.getMonth()
    );
    monthlyCounts.push(count);
  }

  const [enFormeBadge] = await db
    .select({ id: badge.id })
    .from(badge)
    .where(eq(badge.code, "en_forme"))
    .limit(1);

  if (!enFormeBadge) {
    console.warn("[BADGE] en_forme badge not found in database");
    return;
  }

  const [existingBadge] = await db
    .select()
    .from(userBadge)
    .where(
      and(eq(userBadge.userId, userId), eq(userBadge.badgeId, enFormeBadge.id))
    )
    .limit(1);

  const qualifies = monthlyCounts.every((count) => count >= 5);

  if (qualifies && !existingBadge) {
    // Award badge
    await db.insert(userBadge).values({
      userId,
      badgeId: enFormeBadge.id,
      unlockedAt: new Date(),
    });
    console.log(`[BADGE] Awarded en_forme to user ${userId}`);
  }
  // Note: "en_forme" badge is not removed once earned (permanent achievement)
}

/**
 * Update monthly badges for all users
 * Called by the cron job
 */
export async function updateMonthlyBadgesForAllUsers(): Promise<{
  processed: number;
  errors: number;
}> {
  // Get all active users
  const allUsers = await db.select({ id: user.id }).from(user);

  let processed = 0;
  let errors = 0;

  for (const u of allUsers) {
    try {
      await updateJoueurRegulierBadge(u.id);
      await updateEnFormeBadge(u.id);
      processed++;
    } catch (error) {
      console.error(`[BADGE] Error updating badges for user ${u.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}
