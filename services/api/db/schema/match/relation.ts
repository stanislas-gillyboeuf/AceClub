import { match, matchParticipant, set, setScore } from "./schema";
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
}));
