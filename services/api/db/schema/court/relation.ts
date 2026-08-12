import { relations } from "drizzle-orm";
import { court, courtBooking, courtSettings } from "./schema";
import { organization, user } from "../auth/schema";

export const courtRelations = relations(court, ({ one, many }) => ({
  organization: one(organization, {
    fields: [court.organizationId],
    references: [organization.id],
  }),
  bookings: many(courtBooking),
}));

export const courtBookingRelations = relations(courtBooking, ({ one }) => ({
  court: one(court, {
    fields: [courtBooking.courtId],
    references: [court.id],
  }),
  user: one(user, {
    fields: [courtBooking.userId],
    references: [user.id],
  }),
}));

export const courtSettingsRelations = relations(courtSettings, ({ one }) => ({
  organization: one(organization, {
    fields: [courtSettings.organizationId],
    references: [organization.id],
  }),
}));
