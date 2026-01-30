import { relations } from "drizzle-orm";
import { userStreak } from "./schema";
import { user } from "../auth/schema";

export const userStreakRelations = relations(userStreak, ({ one }) => ({
  user: one(user, {
    fields: [userStreak.userId],
    references: [user.id],
  }),
}));
