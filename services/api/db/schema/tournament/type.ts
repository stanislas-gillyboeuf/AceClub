import { tournament, tournamentMatch, tournamentSeed } from "./schema";

export type Tournament = typeof tournament.$inferSelect;
export type NewTournament = typeof tournament.$inferInsert;
export type TournamentSeed = typeof tournamentSeed.$inferSelect;
export type TournamentMatch = typeof tournamentMatch.$inferSelect;
export type TournamentStatusType = "draft" | "in_progress" | "completed";
export type TournamentMatchStatusType = "pending" | "ready" | "bye" | "completed";
