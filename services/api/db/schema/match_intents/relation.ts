import { matchIntent, matchIntentSwipe } from "./schema";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";

export const matchIntentRelations = relations(matchIntent, ({ one, many }) => ({
  swipes: many(matchIntentSwipe),
  user: one(user, {
    fields: [matchIntent.userId],
    references: [user.id],
  }),
}));
