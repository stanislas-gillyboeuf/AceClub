import { userLevel, xpTransaction } from "./schema";

export type UserLevel = typeof userLevel.$inferSelect;
export type NewUserLevel = typeof userLevel.$inferInsert;

export type XpTransaction = typeof xpTransaction.$inferSelect;
export type NewXpTransaction = typeof xpTransaction.$inferInsert;
