import { relations } from "drizzle-orm";
import { clubTag, clubMemberTag } from "./schema";
import { organization, user } from "../auth/schema";

export const clubTagRelations = relations(clubTag, ({ one, many }) => ({
  organization: one(organization, {
    fields: [clubTag.organizationId],
    references: [organization.id],
  }),
  memberTags: many(clubMemberTag),
}));

export const clubMemberTagRelations = relations(clubMemberTag, ({ one }) => ({
  organization: one(organization, {
    fields: [clubMemberTag.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [clubMemberTag.userId],
    references: [user.id],
  }),
  tag: one(clubTag, {
    fields: [clubMemberTag.tagId],
    references: [clubTag.id],
  }),
}));
