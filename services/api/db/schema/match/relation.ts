import { match, matchParticipant, set, setScore, matchComment } from "./schema";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";

export const matchRelations = relations(match, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [match.createdBy],
    references: [user.id],
  }),
  participants: many(matchParticipant),
  sets: many(set),
  setScores: many(setScore),
  comments: many(matchComment),
}));

export const matchCommentRelations = relations(matchComment, ({ one }) => ({
  match: one(match, {
    fields: [matchComment.matchId],
    references: [match.id],
  }),
  user: one(user, {
    fields: [matchComment.userId],
    references: [user.id],
  }),
}));
