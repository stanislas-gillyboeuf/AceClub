import { userLevel, acesTransaction } from "./schema";

export type UserLevel = typeof userLevel.$inferSelect;
export type NewUserLevel = typeof userLevel.$inferInsert;

export type AcesTransaction = typeof acesTransaction.$inferSelect;
export type NewAcesTransaction = typeof acesTransaction.$inferInsert;
