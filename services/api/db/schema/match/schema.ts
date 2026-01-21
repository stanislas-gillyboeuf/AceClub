import { pgTable, text, timestamp, pgEnum, boolean, index, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const MatchStatus = pgEnum("match_status", ["scheduled", "ongoing", "finished"]);
export const MatchSide = pgEnum("match_side", ["home", "away"]);

export const match = pgTable("match", {
    id: text("id").primaryKey(),
    createdBy: text("created_by").notNull().references(() => user.id),
    status: MatchStatus("status").notNull().default("scheduled"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
});


export const matchParticipant = pgTable("match_participant", {
    id: text("id").primaryKey(),
    matchId: text("match_id").notNull().references(() => match.id),
    userId: text("user_id").notNull().references(() => user.id),
    side: MatchSide("side").notNull(),
    isWinner: boolean("is_winner").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("match_participant_matchId_idx").on(table.matchId),
    index("match_participant_userId_idx").on(table.userId),
    uniqueIndex("match_participant_matchId_userId_unique").on(table.matchId, table.userId),


]);

export const set = pgTable("set", {
    id: text("id").primaryKey(),
    matchId: text("match_id").notNull().references(() => match.id),
    setNumber: integer("set_number").notNull().$type<1 | 2 | 3 | 4 | 5>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("set_matchId_idx").on(table.matchId),
]);  

export const setScore = pgTable("set_score", {
    id: text("id").primaryKey(),
    setId: text("set_id").notNull().references(() => set.id),
    participantId: text("participant_id").notNull().references(() => matchParticipant.id),
    games: integer("games").notNull().default(0),
}, (table) => [
    index("set_score_setId_idx").on(table.setId),
    index("set_score_participantId_idx").on(table.participantId),
]);