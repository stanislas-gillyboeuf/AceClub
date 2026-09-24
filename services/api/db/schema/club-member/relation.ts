import { relations } from "drizzle-orm";
import { clubMemberProfile, clubMemberNote, household } from "./schema";
import { organization, user } from "../auth/schema";

export const clubMemberProfileRelations = relations(clubMemberProfile, ({ one }) => ({
  user: one(user, {
    fields: [clubMemberProfile.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [clubMemberProfile.organizationId],
    references: [organization.id],
  }),
  household: one(household, {
    fields: [clubMemberProfile.householdId],
    references: [household.id],
  }),
}));

export const householdRelations = relations(household, ({ one, many }) => ({
  organization: one(organization, {
    fields: [household.organizationId],
    references: [organization.id],
  }),
  payer: one(user, {
    fields: [household.payerUserId],
    references: [user.id],
  }),
  memberProfiles: many(clubMemberProfile),
}));

export const clubMemberNoteRelations = relations(clubMemberNote, ({ one }) => ({
  user: one(user, {
    fields: [clubMemberNote.userId],
    references: [user.id],
  }),
  author: one(user, {
    fields: [clubMemberNote.authorUserId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [clubMemberNote.organizationId],
    references: [organization.id],
  }),
}));
