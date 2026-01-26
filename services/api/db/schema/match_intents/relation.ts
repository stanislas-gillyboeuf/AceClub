import { matchIntent, matchIntentSwipe, matchRequest } from "./schema";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";

export const matchIntentRelations = relations(matchIntent, ({ one, many }) => ({
  swipes: many(matchIntentSwipe),
  requests: many(matchRequest),
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
