import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema/index";
import type { Database } from "./context";
import { seedUsers } from "./users";
import { seedOrganizations } from "./organizations";
import { seedMatchIntents, seedSwipes, seedMatchRequests } from "./match-intents";
import { seedMatches, seedSetsAndScores } from "./matches";
import { seedChallenges } from "./challenges";

// Import all tables for clearing
import {
  user,
  session,
  account,
  verification,
  organization,
  member,
  invitation,
  match,
  matchParticipant,
  set,
  setScore,
  matchIntent,
  matchIntentSwipe,
  matchRequest,
  challengeTemplate,
  userChallenge,
} from "../../db/schema/index";

async function clearDatabase(db: Database): Promise<void> {
  console.log("Clearing database...");

  await db.delete(userChallenge);
  await db.delete(challengeTemplate);

  await db.delete(setScore);
  await db.delete(set);

  await db.delete(matchParticipant);
  await db.delete(match);

  await db.delete(matchRequest);
  await db.delete(matchIntentSwipe);
  await db.delete(matchIntent);

  await db.delete(invitation);
  await db.delete(member);
  await db.delete(organization);

  await db.delete(verification);
  await db.delete(session);
  await db.delete(account);
  await db.delete(user);

  console.log("  ✓ Database cleared");
}

if (!("DATABASE_URL" in process.env)) {
  throw new Error("DATABASE_URL not found. Set it in .env or .env.development.");
}

export async function runSeed(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema }) as unknown as Database;

  console.log("Seed start");

  // Clear all existing data before seeding
  await clearDatabase(db);

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
  await seedChallenges(db);

  await pool.end();
  console.log("Seed done");
}
