import { relations } from "drizzle-orm";
import { clubLevelCategory } from "./schema";
import { organization } from "../auth/schema";

export const clubLevelCategoryRelations = relations(clubLevelCategory, ({ one }) => ({
  organization: one(organization, {
    fields: [clubLevelCategory.organizationId],
    references: [organization.id],
  }),
}));
