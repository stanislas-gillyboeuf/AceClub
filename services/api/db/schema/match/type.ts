import { match, matchParticipant, set, setScore } from "./schema";

export type Match = typeof match.$inferSelect;
export type NewMatch = typeof match.$inferInsert;

export type MatchParticipant = typeof matchParticipant.$inferSelect;
export type NewMatchParticipant = typeof matchParticipant.$inferInsert;

export type Set = typeof set.$inferSelect;
export type NewSet = typeof set.$inferInsert;

export type SetScore = typeof setScore.$inferSelect;
export type NewSetScore = typeof setScore.$inferInsert;