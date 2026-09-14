import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";
import { event } from "../event/schema";
import { SportType } from "../user-preference/schema";

export const tournamentFormat = pgEnum("tournament_format", ["single_elimination"]);
export const tournamentStatus = pgEnum("tournament_status", ["draft", "in_progress", "completed"]);
export const tournamentMatchStatus = pgEnum("tournament_match_status", [
  "pending",
  "ready",
  "bye",
  "completed",
]);

/**
 * A tournament is a bracket layered on top of an existing `event` (1:1) — registration,
 * visibility, dates and description are all the event's, already used by the mobile feed.
 * This table only adds what a bracket needs: sport (for skill-level ordering), format,
 * draw size, and lifecycle status.
 */
export const tournament = pgTable(
  "tournament",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    eventId: text("event_id")
      .notNull()
      .unique()
      .references(() => event.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    sport: SportType("sport").notNull(),
    format: tournamentFormat("format").notNull().default("single_elimination"),
    drawSize: integer("draw_size").notNull(),
    status: tournamentStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("tournament_organizationId_idx").on(table.organizationId)],
);

/** The pool of players entered into the bracket — not necessarily every event registrant,
 * the admin picks who's seeded. `skillLevel` is a snapshot at seed time for display. */
export const tournamentSeed = pgTable(
  "tournament_seed",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tournamentId: text("tournament_id")
      .notNull()
      .references(() => tournament.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    seedNumber: integer("seed_number").notNull(),
    skillLevel: text("skill_level"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tournament_seed_tournamentId_userId_uidx").on(table.tournamentId, table.userId),
    uniqueIndex("tournament_seed_tournamentId_seedNumber_uidx").on(
      table.tournamentId,
      table.seedNumber,
    ),
  ],
);

/**
 * One row per bracket cell. `round`/`position` fully determine the tree shape — a match at
 * (round R, position P) feeds into (round R+1, position floor(P/2)); no extra link columns
 * needed. Round 1 positions are populated at generation time; later rounds start as empty
 * placeholders and get filled in as earlier rounds complete.
 */
export const tournamentMatch = pgTable(
  "tournament_match",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tournamentId: text("tournament_id")
      .notNull()
      .references(() => tournament.id, { onDelete: "cascade" }),
    round: integer("round").notNull(),
    position: integer("position").notNull(),
    player1UserId: text("player1_user_id").references(() => user.id),
    player2UserId: text("player2_user_id").references(() => user.id),
    winnerUserId: text("winner_user_id").references(() => user.id),
    status: tournamentMatchStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("tournament_match_tournamentId_round_position_uidx").on(
      table.tournamentId,
      table.round,
      table.position,
    ),
    index("tournament_match_tournamentId_idx").on(table.tournamentId),
  ],
);
