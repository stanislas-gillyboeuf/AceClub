import { ulid } from "ulid";
import { userLevel, acesTransaction } from "../../db/schema/index.js";
import type { Database } from "./context.js";

const ACES_PER_PARTICIPATION = 10;
const ACES_PER_VICTORY = 25;

export async function seedLevels(
  db: Database,
  ctx: {
    userIds: string[];
    finishedMatchIds: string[];
    matchIdToParticipants: Map<
      string,
      {
        homeUserId: string;
        awayUserId: string;
        winnerUserId: string | null;
      }
    >;
  },
): Promise<{ userLevels: Map<string, { totalAces: number; currentLevel: number }> }> {
  // Calculate aces per user from finished matches
  const userAces = new Map<string, number>();
  const transactionRows: Array<{
    id: string;
    userId: string;
    type: "match_participation" | "match_victory";
    amount: number;
    referenceId: string;
    referenceType: string;
    description: string;
  }> = [];

  for (const matchId of ctx.finishedMatchIds) {
    const participants = ctx.matchIdToParticipants.get(matchId);
    if (!participants) continue;

    // Both players get participation aces
    for (const userId of [participants.homeUserId, participants.awayUserId]) {
      const current = userAces.get(userId) ?? 0;
      userAces.set(userId, current + ACES_PER_PARTICIPATION);

      transactionRows.push({
        id: ulid(),
        userId,
        type: "match_participation",
        amount: ACES_PER_PARTICIPATION,
        referenceId: matchId,
        referenceType: "match",
        description: "Participation au match",
      });
    }

    // Winner gets bonus aces
    if (participants.winnerUserId) {
      const current = userAces.get(participants.winnerUserId) ?? 0;
      userAces.set(participants.winnerUserId, current + ACES_PER_VICTORY);

      transactionRows.push({
        id: ulid(),
        userId: participants.winnerUserId,
        type: "match_victory",
        amount: ACES_PER_VICTORY,
        referenceId: matchId,
        referenceType: "match",
        description: "Victoire du match",
      });
    }
  }

  // Create user_level entries for ALL users (even without matches they get level 1)
  const userLevels = new Map<string, { totalAces: number; currentLevel: number }>();
  const levelRows = [];

  for (const userId of ctx.userIds) {
    const totalAces = userAces.get(userId) ?? 0;
    const currentLevel = Math.floor(totalAces / 100) + 1;
    userLevels.set(userId, { totalAces, currentLevel });

    levelRows.push({
      id: ulid(),
      userId,
      totalAces,
      currentLevel,
    });
  }

  if (levelRows.length > 0) {
    await db.insert(userLevel).values(levelRows);
  }

  if (transactionRows.length > 0) {
    await db.insert(acesTransaction).values(transactionRows);
  }

  console.log(`  Inserted ${levelRows.length} user levels and ${transactionRows.length} aces transactions`);
  return { userLevels };
}
