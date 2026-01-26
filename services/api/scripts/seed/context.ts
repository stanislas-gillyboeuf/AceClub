import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "../../db/schema/index.js";

export type Database = NodePgDatabase<typeof schema>;

export interface SeedContext {
  userIds: string[];
  orgIds: string[];
  intentIds: string[];
  /** intentId -> owner userId (for match requests) */
  intentIdToUserId: Map<string, string>;
  /** swipe rows with action "like", to derive match requests */
  likeSwipes: { matchIntentId: string; swiperUserId: string }[];
  matchIds: string[];
  participantIds: string[];
}

export const SEED_COUNTS = {
  USER_COUNT: 15,
  ORG_COUNT: 5,
  MATCH_INTENTS_PER_USER: 2,
  SWIPE_COUNT: 40,
  MATCH_REQUEST_COUNT: 8,
  MATCHES_COUNT: 4,
} as const;
