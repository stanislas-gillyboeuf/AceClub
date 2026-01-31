import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { eq } from "drizzle-orm";
import { match, matchParticipant, set, setScore } from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

type MatchStatus = "scheduled" | "ongoing" | "finished";

interface MatchData {
  id: string;
  status: MatchStatus;
  startedAt: Date | null;
  finishedAt: Date | null;
  homeParticipantId: string;
  awayParticipantId: string;
}

function generateMatchTimestamps(status: MatchStatus): {
  startedAt: Date | null;
  finishedAt: Date | null;
} {
  if (status === "scheduled") {
    return { startedAt: null, finishedAt: null };
  }

  // Match started between 1-30 days ago
  const startedAt = faker.date.recent({ days: 30 });

  if (status === "ongoing") {
    return { startedAt, finishedAt: null };
  }

  // Finished match: duration between 30 min and 2h30
  const durationMinutes = faker.number.int({ min: 30, max: 150 });
  const finishedAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

  return { startedAt, finishedAt };
}

export async function seedMatches(
  db: Database,
  ctx: { userIds: string[] },
): Promise<{ matchIds: string[]; matchData: MatchData[] }> {
  const matchIds: string[] = [];
  const matchData: MatchData[] = [];

  // Ensure a balanced distribution: mostly finished, some ongoing, few scheduled
  const statusDistribution: MatchStatus[] = [];
  const count = SEED_COUNTS.MATCHES_COUNT;
  const finishedCount = Math.max(1, Math.floor(count * 0.5)); // 50% finished
  const ongoingCount = Math.max(1, Math.floor(count * 0.25)); // 25% ongoing
  const scheduledCount = count - finishedCount - ongoingCount; // rest scheduled

  for (let i = 0; i < finishedCount; i++) statusDistribution.push("finished");
  for (let i = 0; i < ongoingCount; i++) statusDistribution.push("ongoing");
  for (let i = 0; i < scheduledCount; i++) statusDistribution.push("scheduled");

  // Shuffle the distribution
  faker.helpers.shuffle(statusDistribution);

  for (let i = 0; i < SEED_COUNTS.MATCHES_COUNT; i++) {
    const id = ulid();
    const status = statusDistribution[i];
    const { startedAt, finishedAt } = generateMatchTimestamps(status);
    const [userA, userB] = faker.helpers.arrayElements(ctx.userIds, 2);
    const homeParticipantId = ulid();
    const awayParticipantId = ulid();

    matchIds.push(id);
    matchData.push({
      id,
      status,
      startedAt,
      finishedAt,
      homeParticipantId,
      awayParticipantId,
    });

    await db.insert(match).values({
      id,
      createdBy: userA,
      status,
      startedAt,
      finishedAt,
    });

    await db.insert(matchParticipant).values([
      { id: homeParticipantId, matchId: id, userId: userA, side: "home", isWinner: false },
      { id: awayParticipantId, matchId: id, userId: userB, side: "away", isWinner: false },
    ]);
  }

  console.log(`  Inserted ${matchIds.length} matches`);
  console.log(`  Inserted ${matchIds.length * 2} match participants`);

  return { matchIds, matchData };
}

/**
 * Generate valid tennis set scores.
 * Winner must have 6+ games with 2+ game lead, or 7 games (tiebreak at 6-6).
 */
function generateValidSetScore(): { winnerGames: number; loserGames: number } {
  const scenarios = [
    { winnerGames: 6, loserGames: 0 },
    { winnerGames: 6, loserGames: 1 },
    { winnerGames: 6, loserGames: 2 },
    { winnerGames: 6, loserGames: 3 },
    { winnerGames: 6, loserGames: 4 },
    { winnerGames: 7, loserGames: 5 }, // 7-5
    { winnerGames: 7, loserGames: 6 }, // Tiebreak 7-6
  ];
  return faker.helpers.arrayElement(scenarios);
}

export async function seedSetsAndScores(
  db: Database,
  ctx: { matchData: MatchData[] },
): Promise<void> {
  for (const data of ctx.matchData) {
    // Only finished matches have sets/scores
    if (data.status !== "finished") {
      continue;
    }

    // Determine number of sets (best of 3: 2 or 3 sets)
    const setCount = faker.helpers.arrayElement([2, 3]);

    // Track sets won by each participant
    let homeSetsWon = 0;
    let awaySetsWon = 0;

    // Pre-determine the match winner
    const homeWinsMatch = faker.datatype.boolean();

    for (let s = 1; s <= setCount; s++) {
      const setId = ulid();
      const { winnerGames, loserGames } = generateValidSetScore();

      // Determine set winner based on match outcome
      // Winner needs 2 sets to win (best of 3)
      let homeWinsSet: boolean;

      if (homeWinsMatch) {
        // Home needs to win 2 sets
        if (homeSetsWon < 2 && (awaySetsWon === 0 || s === setCount)) {
          homeWinsSet = true;
        } else {
          homeWinsSet = homeSetsWon < 2;
        }
      } else {
        // Away needs to win 2 sets
        if (awaySetsWon < 2 && (homeSetsWon === 0 || s === setCount)) {
          homeWinsSet = false;
        } else {
          homeWinsSet = awaySetsWon >= 2;
        }
      }

      if (homeWinsSet) {
        homeSetsWon++;
      } else {
        awaySetsWon++;
      }

      await db.insert(set).values({
        id: setId,
        matchId: data.id,
        setNumber: s as 1 | 2 | 3 | 4 | 5,
      });

      await db.insert(setScore).values([
        {
          id: ulid(),
          setId,
          participantId: data.homeParticipantId,
          games: homeWinsSet ? winnerGames : loserGames,
        },
        {
          id: ulid(),
          setId,
          participantId: data.awayParticipantId,
          games: homeWinsSet ? loserGames : winnerGames,
        },
      ]);
    }

    // Update the winner
    const winnerId = homeWinsMatch ? data.homeParticipantId : data.awayParticipantId;
    await db
      .update(matchParticipant)
      .set({ isWinner: true })
      .where(eq(matchParticipant.id, winnerId));
  }

  console.log("  Inserted sets and set scores with winners");
}
