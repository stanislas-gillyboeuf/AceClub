import { relations } from "drizzle-orm";
import { userLevel, xpTransaction } from "./schema";
import { user } from "../auth/schema";

export const userLevelRelations = relations(userLevel, ({ one }) => ({
  user: one(user, {
    fields: [userLevel.userId],
    references: [user.id],
  }),
}));

export const xpTransactionRelations = relations(xpTransaction, ({ one }) => ({
  user: one(user, {
    fields: [xpTransaction.userId],
    references: [user.id],
  }),
}));
