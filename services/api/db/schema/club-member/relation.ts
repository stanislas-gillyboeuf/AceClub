import { relations } from "drizzle-orm";
import { clubMemberProfile, clubMemberNote } from "./schema";
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
