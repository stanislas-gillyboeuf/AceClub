import { relations } from "drizzle-orm";
import { challengeTemplate, userChallenge } from "./schema";
import { user } from "../auth/schema";

export const challengeTemplateRelations = relations(challengeTemplate, ({ many }) => ({
  userChallenges: many(userChallenge),
}));

export const userChallengeRelations = relations(userChallenge, ({ one }) => ({
  user: one(user, {
    fields: [userChallenge.userId],
    references: [user.id],
  }),
  template: one(challengeTemplate, {
    fields: [userChallenge.templateId],
    references: [challengeTemplate.id],
  }),
}));
