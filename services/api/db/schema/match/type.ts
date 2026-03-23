import {
  match,
  matchParticipant,
  set,
  setScore,
  matchPhoto,
  matchComment,
  matchFeedback,
  matchLike,
} from "./schema";

export type Match = typeof match.$inferSelect;
export type NewMatch = typeof match.$inferInsert;

export type MatchParticipant = typeof matchParticipant.$inferSelect;
export type NewMatchParticipant = typeof matchParticipant.$inferInsert;

export type MatchSet = typeof set.$inferSelect;
export type NewMatchSet = typeof set.$inferInsert;

export type SetScore = typeof setScore.$inferSelect;
export type NewSetScore = typeof setScore.$inferInsert;

export type MatchPhoto = typeof matchPhoto.$inferSelect;
export type NewMatchPhoto = typeof matchPhoto.$inferInsert;

export type MatchComment = typeof matchComment.$inferSelect;
export type NewMatchComment = typeof matchComment.$inferInsert;

export type MatchFeedback = typeof matchFeedback.$inferSelect;
export type NewMatchFeedback = typeof matchFeedback.$inferInsert;

export type MatchLike = typeof matchLike.$inferSelect;
export type NewMatchLike = typeof matchLike.$inferInsert;
