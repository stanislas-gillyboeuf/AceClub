import { relations } from "drizzle-orm";
import { clubMemberProfile } from "./schema";
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
