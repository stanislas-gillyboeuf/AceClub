import { relations } from "drizzle-orm";
import { court, courtBooking } from "./schema";
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
