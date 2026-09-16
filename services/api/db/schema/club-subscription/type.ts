import { subscriptionType, memberSubscription } from "./schema";

export type SubscriptionType = typeof subscriptionType.$inferSelect;
export type NewSubscriptionType = typeof subscriptionType.$inferInsert;
export type MemberSubscription = typeof memberSubscription.$inferSelect;
export type NewMemberSubscription = typeof memberSubscription.$inferInsert;

export type SubscriptionStatusType = "active" | "cancelled";
