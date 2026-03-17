import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema/index";
import type { Database } from "./context";
import { seedUsers } from "./users";
import { seedOrganizations } from "./organizations";
import { seedUserPreferences } from "./user-preferences";
import { seedMatchIntents, seedSwipes, seedMatchRequests } from "./match-intents";
import { seedMatches, seedSetsAndScores } from "./matches";
import { seedConversations } from "./conversations";
import { seedComments } from "./comments";
import { seedLevels } from "./levels";
import { seedStreaks } from "./streaks";
import { seedTitles } from "./titles";
import { seedNotifications } from "./notifications";
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
  matchComment,
  matchFeedback,
  matchPhoto,
  matchLike,
  set,
  setScore,
  matchIntent,
  matchIntentSwipe,
  matchRequest,
  challengeTemplate,
  userChallenge,
  notification,
  deviceToken,
  userTitle,
  title,
  message,
  conversationParticipant,
  conversation,
  acesTransaction,
  userLevel,
  userStreak,
  userPreference,
  clubRequest,
  badge,
  userBadge,
} from "../../db/schema/index";

async function clearDatabase(db: Database): Promise<void> {
  console.log("Clearing database...");

  // Notifications & device tokens
  await db.delete(notification);
  await db.delete(deviceToken);

  // Rewards: user titles & badges
  await db.delete(userTitle);
  await db.delete(title);
  await db.delete(userBadge);
  await db.delete(badge);

  // Levels & streaks
  await db.delete(acesTransaction);
  await db.delete(userLevel);
  await db.delete(userStreak);

  // Challenges
  await db.delete(userChallenge);
  await db.delete(challengeTemplate);

  // Conversations & messages
  await db.delete(message);
  await db.delete(conversationParticipant);

  // Match domain (must clear dependent tables before match)
  await Promise.all([
    db.delete(matchComment),
    db.delete(matchFeedback),
    db.delete(matchPhoto),
    db.delete(matchLike),
  ]);
  await db.delete(setScore);
  await db.delete(set);
  await db.delete(matchParticipant);
  await db.delete(match);

  // Now conversation (after match FK is cleared)
  await db.delete(conversation);

  // Match intents
  await db.delete(matchRequest);
  await db.delete(matchIntentSwipe);
  await db.delete(matchIntent);

  // User preferences
  await db.delete(userPreference);

  // Club requests
  await db.delete(clubRequest);

  // Organizations
  await db.delete(invitation);
  await db.delete(member);
  await db.delete(organization);

  // Auth
  await db.delete(verification);
  await db.delete(session);
  await db.delete(account);
  await db.delete(user);

  console.log("  Database cleared");
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

  // 1. Users
  const { userIds, userRows } = await seedUsers(db);

  // 2. Organizations (with guaranteed membership)
  const { orgIds, userToOrgs } = await seedOrganizations(db, { userIds });

  // 3. User preferences
  await seedUserPreferences(db, { userIds, userToOrgs });

  // 4. Match intents, swipes, match requests
  const { intentIds, intentIdToUserId } = await seedMatchIntents(db, { userIds });
  const { likeSwipes } = await seedSwipes(db, { userIds, intentIds, intentIdToUserId });
  await seedMatchRequests(db, { userIds, intentIdToUserId, likeSwipes });

  // 5. Matches & sets/scores
  const { matchIds, matchData, finishedMatchIds, matchIdToParticipants } = await seedMatches(db, {
    userIds,
  });
  await seedSetsAndScores(db, { matchData, matchIdToParticipants });

  // 6. Conversations & messages
  await seedConversations(db, { matchData });

  // 7. Match comments
  await seedComments(db, { finishedMatchIds, matchIdToParticipants, userRows });

  // 8. Levels & aces transactions
  const { userLevels } = await seedLevels(db, {
    userIds,
    finishedMatchIds,
    matchIdToParticipants,
  });

  // 9. Streaks
  await seedStreaks(db, { userIds, matchData });

  // 10. Titles & user titles
  await seedTitles(db, { userIds, userLevels });

  // 11. Notifications
  await seedNotifications(db, { userIds, matchData, userRows });

  // 12. Challenges (unchanged)
  await seedChallenges(db);

  await pool.end();
  console.log("Seed done");
}
