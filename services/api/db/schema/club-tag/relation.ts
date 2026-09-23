import { relations } from "drizzle-orm";
import { clubTag } from "./schema";
import { organization } from "../auth/schema";

export const clubTagRelations = relations(clubTag, ({ one }) => ({
  organization: one(organization, {
    fields: [clubTag.organizationId],
    references: [organization.id],
  }),
}));
