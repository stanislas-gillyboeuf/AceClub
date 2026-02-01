import { challengeTemplate, userChallenge } from "./schema";

export type ChallengeTemplate = typeof challengeTemplate.$inferSelect;
export type NewChallengeTemplate = typeof challengeTemplate.$inferInsert;

export type UserChallenge = typeof userChallenge.$inferSelect;
export type NewUserChallenge = typeof userChallenge.$inferInsert;
