import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import {
  match,
  matchParticipant,
  set,
  setScore,
} from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { SEED_COUNTS } from "./context.js";

export async function seedMatches(
  db: Database,
  ctx: { userIds: string[] }
): Promise<{ matchIds: string[]; participantIds: string[] }> {
  const matchIds: string[] = [];
  const participantIds: string[] = [];

  for (let i = 0; i < SEED_COUNTS.MATCHES_COUNT; i++) {
    const id = ulid();
    matchIds.push(id);
    await db.insert(match).values({
      id,
      createdBy: faker.helpers.arrayElement(ctx.userIds),
      status: faker.helpers.arrayElement([
        "scheduled",
        "ongoing",
        "finished",
      ]),
      startedAt: null,
      finishedAt: null,
    });
  }

  console.log(`  Inserted ${matchIds.length} matches`);

  for (const matchId of matchIds) {
    const [userA, userB] = faker.helpers.arrayElements(ctx.userIds, 2);
    const pa = ulid();
    const pb = ulid();
    participantIds.push(pa, pb);
    await db.insert(matchParticipant).values([
      { id: pa, matchId, userId: userA, side: "home", isWinner: false },
      { id: pb, matchId, userId: userB, side: "away", isWinner: false },
    ]);
  }

  console.log(`  Inserted ${matchIds.length * 2} match participants`);

  return { matchIds, participantIds };
}

export async function seedSetsAndScores(
  db: Database,
  ctx: { matchIds: string[]; participantIds: string[] }
): Promise<void> {
  for (let m = 0; m < ctx.matchIds.length; m++) {
    const matchId = ctx.matchIds[m];
    const setCount = faker.helpers.arrayElement([1, 2, 3]);
    const participants = ctx.participantIds.slice(m * 2, m * 2 + 2);

    for (let s = 1; s <= setCount; s++) {
      const setId = ulid();
      await db.insert(set).values({
        id: setId,
        matchId,
        setNumber: s as 1 | 2 | 3 | 4 | 5,
      });
      await db.insert(setScore).values([
        {
          id: ulid(),
          setId,
          participantId: participants[0],
          games: faker.number.int({ min: 3, max: 7 }),
        },
        {
          id: ulid(),
          setId,
          participantId: participants[1],
          games: faker.number.int({ min: 0, max: 6 }),
        },
      ]);
    }
  }

  console.log("  Inserted sets and set scores");
}
