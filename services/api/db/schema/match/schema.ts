import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";
import { user, organization } from "../auth/schema";
import { conversation } from "../conversation/schema";
import { ulid } from "ulid";

export const MatchStatus = pgEnum("match_status", ["scheduled", "ongoing", "finished"]);
export const MatchSide = pgEnum("match_side", ["home", "away"]);
export const MatchType = pgEnum("match_type", ["match", "training"]);

export const match = pgTable(
  "match",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    conversationId: text("conversation_id").references(() => conversation.id),
    venueOrganizationId: text("venue_organization_id").references(() => organization.id),
    status: MatchStatus("status").notNull().default("scheduled"),
    type: MatchType("type").notNull().default("match"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [
    index("match_conversationId_idx").on(table.conversationId),
    index("match_venueOrganizationId_idx").on(table.venueOrganizationId),
  ],
);

export const matchParticipant = pgTable(
  "match_participant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    side: MatchSide("side").notNull(),
    isWinner: boolean("is_winner").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("match_participant_matchId_idx").on(table.matchId),
    index("match_participant_userId_idx").on(table.userId),
    uniqueIndex("match_participant_matchId_userId_unique").on(table.matchId, table.userId),
  ],
);

export const set = pgTable(
  "set",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id),
    setNumber: integer("set_number").notNull().$type<1 | 2 | 3 | 4 | 5>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("set_matchId_idx").on(table.matchId)],
);

export const setScore = pgTable(
  "set_score",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    setId: text("set_id")
      .notNull()
      .references(() => set.id),
    participantId: text("participant_id")
      .notNull()
      .references(() => matchParticipant.id),
    games: integer("games").notNull().default(0),
  },
  (table) => [
    index("set_score_setId_idx").on(table.setId),
    index("set_score_participantId_idx").on(table.participantId),
  ],
);

export const MatchSensation = pgEnum("match_sensation", ["bad", "average", "good", "great"]);

export const matchFeedback = pgTable(
  "match_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    sensation: MatchSensation("sensation").notNull(),
    comment: text("comment"),
    visibleToClub: boolean("visible_to_club").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("match_feedback_matchId_idx").on(table.matchId),
    uniqueIndex("match_feedback_matchId_userId_unique").on(table.matchId, table.userId),
  ],
);

export const matchPhoto = pgTable(
  "match_photo",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("match_photo_matchId_idx").on(table.matchId),
    uniqueIndex("match_photo_matchId_userId_unique").on(table.matchId, table.userId),
  ],
);

export const matchLike = pgTable(
  "match_like",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("match_like_matchId_idx").on(table.matchId),
    uniqueIndex("match_like_matchId_userId_unique").on(table.matchId, table.userId),
  ],
);

export const matchComment = pgTable(
  "match_comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    content: text("content").notNull(),
    userName: text("user_name").notNull(),
    userImage: text("user_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("match_comment_matchId_idx").on(table.matchId),
    uniqueIndex("match_comment_matchId_userId_unique").on(table.matchId, table.userId),
  ],
);
