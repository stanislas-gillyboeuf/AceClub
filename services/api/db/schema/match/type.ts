import { match, matchParticipant, set, setScore, matchComment } from "./schema";

export type Match = typeof match.$inferSelect;
export type NewMatch = typeof match.$inferInsert;

export type MatchParticipant = typeof matchParticipant.$inferSelect;
export type NewMatchParticipant = typeof matchParticipant.$inferInsert;

export type MatchSet = typeof set.$inferSelect;
export type NewMatchSet = typeof set.$inferInsert;

export type SetScore = typeof setScore.$inferSelect;
export type NewSetScore = typeof setScore.$inferInsert;

export type MatchComment = typeof matchComment.$inferSelect;
export type NewMatchComment = typeof matchComment.$inferInsert;
