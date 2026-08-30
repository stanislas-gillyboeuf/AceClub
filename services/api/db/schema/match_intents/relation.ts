import { matchIntent, matchIntentSwipe, matchIntentTeammate, matchRequest } from "./schema";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";

export const matchIntentRelations = relations(matchIntent, ({ one, many }) => ({
  swipes: many(matchIntentSwipe),
  requests: many(matchRequest),
  teammates: many(matchIntentTeammate),
  user: one(user, {
    fields: [matchIntent.userId],
    references: [user.id],
  }),
}));

export const matchRequestRelations = relations(matchRequest, ({ one }) => ({
  matchIntent: one(matchIntent, {
    fields: [matchRequest.matchIntentId],
    references: [matchIntent.id],
  }),
  requester: one(user, {
    fields: [matchRequest.requesterId],
    references: [user.id],
  }),
  receiver: one(user, {
    fields: [matchRequest.receiverId],
    references: [user.id],
  }),
}));

export const matchIntentTeammateRelations = relations(matchIntentTeammate, ({ one }) => ({
  matchIntent: one(matchIntent, {
    fields: [matchIntentTeammate.matchIntentId],
    references: [matchIntent.id],
  }),
  user: one(user, {
    fields: [matchIntentTeammate.userId],
    references: [user.id],
  }),
}));
