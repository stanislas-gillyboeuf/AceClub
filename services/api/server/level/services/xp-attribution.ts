import { eq, sql } from "drizzle-orm";
import { db } from "../../../db";
import { userLevel, xpTransaction } from "../../../db/schema/level/schema";
import { XP_REWARDS, calculateLevelFromXp } from "./xp-calculator";
import type { MatchParticipant } from "../../../db/schema/match/type";

export async function attributeMatchXp(
  matchId: string,
  participants: MatchParticipant[],
  multiplier: number = 1.0
): Promise<void> {
  for (const participant of participants) {
    const userId = participant.userId;

    const participationXp = Math.floor(XP_REWARDS.MATCH_PARTICIPATION * multiplier);
    await addXpTransaction(userId, {
      type: "match_participation",
      amount: participationXp,
      referenceId: matchId,
      referenceType: "match",
      multiplier,
      description: "Participation à un match",
    });

    if (participant.isWinner) {
      const victoryXp = Math.floor(XP_REWARDS.MATCH_VICTORY * multiplier);
      await addXpTransaction(userId, {
        type: "match_victory",
        amount: victoryXp,
        referenceId: matchId,
        referenceType: "match",
        multiplier,
        description: "Victoire du match",
      });
    }

    await recalculateUserLevel(userId);
  }
}

async function addXpTransaction(
  userId: string,
  data: {
    type: "match_participation" | "match_victory" | "challenge_completed" | "streak_bonus" | "level_up_bonus" | "badge_bonus";
    amount: number;
    referenceId?: string;
    referenceType?: string;
    multiplier?: number;
    description?: string;
  }
): Promise<void> {
  await db.insert(xpTransaction).values({
    userId,
    type: data.type,
    amount: data.amount,
    referenceId: data.referenceId ?? null,
    referenceType: data.referenceType ?? null,
    multiplier: data.multiplier ?? 1.0,
    description: data.description ?? null,
  });

  const [existing] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(userLevel)
      .set({
        totalXp: sql`${userLevel.totalXp} + ${data.amount}`,
      })
      .where(eq(userLevel.userId, userId));
  } else {
    await db.insert(userLevel).values({
      userId,
      totalXp: data.amount,
      currentLevel: 1,
    });
  }
}

async function recalculateUserLevel(userId: string): Promise<void> {
  const [levelData] = await db
    .select()
    .from(userLevel)
    .where(eq(userLevel.userId, userId))
    .limit(1);

  if (!levelData) return;

  const levelInfo = calculateLevelFromXp(levelData.totalXp);

  if (levelInfo.level !== levelData.currentLevel) {
    await db
      .update(userLevel)
      .set({
        currentLevel: levelInfo.level,
      })
      .where(eq(userLevel.userId, userId));
  }
}
