import { relations } from "drizzle-orm";
import { subscriptionType, memberSubscription } from "./schema";
import { organization, user } from "../auth/schema";

export const subscriptionTypeRelations = relations(subscriptionType, ({ one, many }) => ({
  organization: one(organization, {
    fields: [subscriptionType.organizationId],
    references: [organization.id],
  }),
  assignments: many(memberSubscription),
}));

export const memberSubscriptionRelations = relations(memberSubscription, ({ one }) => ({
  subscriptionType: one(subscriptionType, {
    fields: [memberSubscription.subscriptionTypeId],
    references: [subscriptionType.id],
  }),
  user: one(user, {
    fields: [memberSubscription.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [memberSubscription.organizationId],
    references: [organization.id],
  }),
}));
