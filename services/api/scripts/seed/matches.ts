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
  scheduledAt: Date;
  homeParticipantId: string;
  awayParticipantId: string;
  homeUserId: string;
  awayUserId: string;
  winnerUserId: string | null;
}

export async function seedMatches(
  db: Database,
  ctx: { userIds: string[] },
): Promise<{
  matchIds: string[];
  matchData: MatchData[];
  finishedMatchIds: string[];
  matchIdToParticipants: Map<
    string,
    {
      homeUserId: string;
      awayUserId: string;
      homeParticipantId: string;
      awayParticipantId: string;
      winnerUserId: string | null;
    }
  >;
}> {
  const matchIds: string[] = [];
  const matchData: MatchData[] = [];
  const finishedMatchIds: string[] = [];
  const matchIdToParticipants = new Map<
    string,
    {
      homeUserId: string;
      awayUserId: string;
      homeParticipantId: string;
      awayParticipantId: string;
      winnerUserId: string | null;
    }
  >();

  const count = SEED_COUNTS.MATCHES_COUNT;
  // 60% finished, 20% ongoing, 20% scheduled
  const finishedCount = Math.floor(count * 0.6); // 12
  const ongoingCount = Math.floor(count * 0.2); // 4
  const scheduledCount = count - finishedCount - ongoingCount; // 4

  const statusList: MatchStatus[] = [];
  for (let i = 0; i < finishedCount; i++) statusList.push("finished");
  for (let i = 0; i < ongoingCount; i++) statusList.push("ongoing");
  for (let i = 0; i < scheduledCount; i++) statusList.push("scheduled");

  // Sort so finished are oldest, ongoing recent, scheduled future
  // We'll assign dates in order below

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const id = ulid();
    const status = statusList[i];
    const [userA, userB] = faker.helpers.arrayElements(ctx.userIds, 2);
    const homeParticipantId = ulid();
    const awayParticipantId = ulid();

    let scheduledAt: Date;
    let startedAt: Date | null = null;
    let finishedAt: Date | null = null;

    if (status === "finished") {
      // Spread finished matches over last 4 weeks
      const daysAgo = Math.floor((i / finishedCount) * 28) + 1;
      scheduledAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      startedAt = new Date(scheduledAt.getTime() + 5 * 60 * 1000); // started 5min after scheduled
      const durationMinutes = faker.number.int({ min: 30, max: 150 });
      finishedAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    } else if (status === "ongoing") {
      // Ongoing matches: started within last few hours
      const hoursAgo = faker.number.int({ min: 1, max: 3 });
      scheduledAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      startedAt = new Date(scheduledAt.getTime() + 5 * 60 * 1000);
    } else {
      // Scheduled: in the next 1-14 days
      const daysAhead = faker.number.int({ min: 1, max: 14 });
      scheduledAt = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    }

    matchIds.push(id);

    // Winner will be determined in seedSetsAndScores for finished matches
    const data: MatchData = {
      id,
      status,
      startedAt,
      finishedAt,
      scheduledAt,
      homeParticipantId,
      awayParticipantId,
      homeUserId: userA,
      awayUserId: userB,
      winnerUserId: null,
    };
    matchData.push(data);

    if (status === "finished") {
      finishedMatchIds.push(id);
    }

    matchIdToParticipants.set(id, {
      homeUserId: userA,
      awayUserId: userB,
      homeParticipantId,
      awayParticipantId,
      winnerUserId: null,
    });

    await db.insert(match).values({
      id,
      createdBy: userA,
      status,
      scheduledAt,
      startedAt,
      finishedAt,
    });

    await db.insert(matchParticipant).values([
      { id: homeParticipantId, matchId: id, userId: userA, side: "home", isWinner: false },
      { id: awayParticipantId, matchId: id, userId: userB, side: "away", isWinner: false },
    ]);
  }

  console.log(
    `  Inserted ${matchIds.length} matches (${finishedCount} finished, ${ongoingCount} ongoing, ${scheduledCount} scheduled)`,
  );
  console.log(`  Inserted ${matchIds.length * 2} match participants`);

  return { matchIds, matchData, finishedMatchIds, matchIdToParticipants };
}

/**
 * Generate valid tennis set scores.
 */
function generateValidSetScore(): { winnerGames: number; loserGames: number } {
  const scenarios = [
    { winnerGames: 6, loserGames: 0 },
    { winnerGames: 6, loserGames: 1 },
    { winnerGames: 6, loserGames: 2 },
    { winnerGames: 6, loserGames: 3 },
    { winnerGames: 6, loserGames: 4 },
    { winnerGames: 7, loserGames: 5 },
    { winnerGames: 7, loserGames: 6 },
  ];
  return faker.helpers.arrayElement(scenarios);
}

export async function seedSetsAndScores(
  db: Database,
  ctx: {
    matchData: MatchData[];
    matchIdToParticipants: Map<
      string,
      {
        homeUserId: string;
        awayUserId: string;
        homeParticipantId: string;
        awayParticipantId: string;
        winnerUserId: string | null;
      }
    >;
  },
): Promise<void> {
  for (const data of ctx.matchData) {
    if (data.status !== "finished") continue;

    const setCount = faker.helpers.arrayElement([2, 3]);
    let homeSetsWon = 0;
    let awaySetsWon = 0;
    const homeWinsMatch = faker.datatype.boolean();

    for (let s = 1; s <= setCount; s++) {
      const setId = ulid();
      const { winnerGames, loserGames } = generateValidSetScore();

      let homeWinsSet: boolean;
      if (homeWinsMatch) {
        if (homeSetsWon < 2 && (awaySetsWon === 0 || s === setCount)) {
          homeWinsSet = true;
        } else {
          homeWinsSet = homeSetsWon < 2;
        }
      } else {
        if (awaySetsWon < 2 && (homeSetsWon === 0 || s === setCount)) {
          homeWinsSet = false;
        } else {
          homeWinsSet = awaySetsWon >= 2;
        }
      }

      if (homeWinsSet) homeSetsWon++;
      else awaySetsWon++;

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

    const winnerParticipantId = homeWinsMatch ? data.homeParticipantId : data.awayParticipantId;
    const winnerUserId = homeWinsMatch ? data.homeUserId : data.awayUserId;

    await db
      .update(matchParticipant)
      .set({ isWinner: true })
      .where(eq(matchParticipant.id, winnerParticipantId));

    // Update the matchData and map with winner info
    data.winnerUserId = winnerUserId;
    const participants = ctx.matchIdToParticipants.get(data.id);
    if (participants) {
      participants.winnerUserId = winnerUserId;
    }
  }

  console.log("  Inserted sets and set scores with winners");
}
