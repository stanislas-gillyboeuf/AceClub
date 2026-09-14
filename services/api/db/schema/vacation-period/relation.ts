import { relations } from "drizzle-orm";
import { vacationPeriod } from "./schema";
import { organization } from "../auth/schema";

export const vacationPeriodRelations = relations(vacationPeriod, ({ one }) => ({
  organization: one(organization, {
    fields: [vacationPeriod.organizationId],
    references: [organization.id],
  }),
}));
