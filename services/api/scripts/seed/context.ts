import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "../../db/schema/index.js";

export type Database = NodePgDatabase<typeof schema>;

export interface SeedContext {
  userIds: string[];
  orgIds: string[];
  /** userId -> list of orgIds the user belongs to */
  userToOrgs: Map<string, string[]>;
  intentIds: string[];
  /** intentId -> owner userId (for match requests) */
  intentIdToUserId: Map<string, string>;
  /** swipe rows with action "like", to derive match requests */
  likeSwipes: { matchIntentId: string; swiperUserId: string }[];
  matchIds: string[];
  participantIds: string[];
  /** IDs of matches with status "finished" */
  finishedMatchIds: string[];
  /** matchId -> { homeUserId, awayUserId, homeParticipantId, awayParticipantId, winnerId } */
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
  /** userId -> { totalAces, currentLevel } */
  userLevels: Map<string, { totalAces: number; currentLevel: number }>;
  /** userId -> user row data for denormalized fields */
  userRows: Map<string, { name: string; image: string | null }>;
}

export const SEED_COUNTS = {
  USER_COUNT: 15,
  ORG_COUNT: 5,
  MATCH_INTENTS_PER_USER: 2,
  SWIPE_COUNT: 40,
  MATCH_REQUEST_COUNT: 8,
  MATCHES_COUNT: 20,
  MESSAGES_PER_CONVERSATION: 4,
  NOTIFICATIONS_PER_USER: 3,
} as const;
