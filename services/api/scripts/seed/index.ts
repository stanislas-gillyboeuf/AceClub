import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema/index.js";
import type { Database } from "./context.js";
import { seedUsers } from "./users.js";
import { seedOrganizations } from "./organizations.js";
import {
  seedMatchIntents,
  seedSwipes,
  seedMatchRequests,
} from "./match-intents.js";
import { seedMatches, seedSetsAndScores } from "./matches.js";

if (!("DATABASE_URL" in process.env)) {
  throw new Error("DATABASE_URL not found. Set it in .env or .env.development.");
}

export async function runSeed(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema }) as unknown as Database;

  console.log("Seed start");

  const { userIds } = await seedUsers(db);
  const { orgIds } = await seedOrganizations(db, { userIds });
  const { intentIds, intentIdToUserId } = await seedMatchIntents(db, {
    userIds,
  });
  const { likeSwipes } = await seedSwipes(db, {
    userIds,
    intentIds,
    intentIdToUserId,
  });
  await seedMatchRequests(db, {
    userIds,
    intentIdToUserId,
    likeSwipes,
  });
  const { matchIds, participantIds } = await seedMatches(db, { userIds });
  await seedSetsAndScores(db, { matchIds, participantIds });

  await pool.end();
  console.log("Seed done");
}
