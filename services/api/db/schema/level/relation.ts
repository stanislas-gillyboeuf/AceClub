import { relations } from "drizzle-orm";
import { userLevel, acesTransaction } from "./schema";
import { user } from "../auth/schema";

export const userLevelRelations = relations(userLevel, ({ one }) => ({
  user: one(user, {
    fields: [userLevel.userId],
    references: [user.id],
  }),
}));

export const acesTransactionRelations = relations(acesTransaction, ({ one }) => ({
  user: one(user, {
    fields: [acesTransaction.userId],
    references: [user.id],
  }),
}));
