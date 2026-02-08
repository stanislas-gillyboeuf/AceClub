import { eq, sql } from "drizzle-orm";
import { db } from "../../../db";
import { userLevel, acesTransaction } from "../../../db/schema/level/schema";
import { ACES_REWARDS, calculateLevelFromAces } from "./xp-calculator";
import type { MatchParticipant } from "../../../db/schema/match/type";

export async function attributeMatchAces(
  matchId: string,
  participants: MatchParticipant[],
  multiplier: number = 1.0,
): Promise<void> {
  for (const participant of participants) {
    const userId = participant.userId;

    const participationAces = Math.floor(ACES_REWARDS.MATCH_PARTICIPATION * multiplier);
    await addAcesTransaction(userId, {
      type: "match_participation",
      amount: participationAces,
      referenceId: matchId,
      referenceType: "match",
      multiplier,
      description: "Participation à un match",
    });

    if (participant.isWinner) {
      const victoryAces = Math.floor(ACES_REWARDS.MATCH_VICTORY * multiplier);
      await addAcesTransaction(userId, {
        type: "match_victory",
        amount: victoryAces,
        referenceId: matchId,
        referenceType: "match",
        multiplier,
        description: "Victoire du match",
      });
    }

    await recalculateUserLevel(userId);
  }
}

async function addAcesTransaction(
  userId: string,
  data: {
    type:
      | "match_participation"
      | "match_victory"
      | "challenge_completed"
      | "streak_bonus"
      | "level_up_bonus"
      | "badge_bonus";
    amount: number;
    referenceId?: string;
    referenceType?: string;
    multiplier?: number;
    description?: string;
  },
): Promise<void> {
  await db.insert(acesTransaction).values({
    userId,
    type: data.type,
    amount: data.amount,
    referenceId: data.referenceId ?? null,
    referenceType: data.referenceType ?? null,
    multiplier: data.multiplier ?? 1.0,
    description: data.description ?? null,
  });

  const [existing] = await db.select().from(userLevel).where(eq(userLevel.userId, userId)).limit(1);

  if (existing) {
    await db
      .update(userLevel)
      .set({
        totalAces: sql`${userLevel.totalAces} + ${data.amount}`,
      })
      .where(eq(userLevel.userId, userId));
  } else {
    await db.insert(userLevel).values({
      userId,
      totalAces: data.amount,
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

  const levelInfo = calculateLevelFromAces(levelData.totalAces);

  if (levelInfo.level !== levelData.currentLevel) {
    await db
      .update(userLevel)
      .set({
        currentLevel: levelInfo.level,
      })
      .where(eq(userLevel.userId, userId));
  }
}
