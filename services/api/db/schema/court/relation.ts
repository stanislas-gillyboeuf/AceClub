import { relations } from "drizzle-orm";
import { court, courtBooking, courtBookingParticipant, courtSettings } from "./schema";
import { organization, user } from "../auth/schema";

export const courtRelations = relations(court, ({ one, many }) => ({
  organization: one(organization, {
    fields: [court.organizationId],
    references: [organization.id],
  }),
  bookings: many(courtBooking),
}));

export const courtBookingRelations = relations(courtBooking, ({ one, many }) => ({
  court: one(court, {
    fields: [courtBooking.courtId],
    references: [court.id],
  }),
  user: one(user, {
    fields: [courtBooking.userId],
    references: [user.id],
  }),
  participants: many(courtBookingParticipant),
}));

export const courtBookingParticipantRelations = relations(courtBookingParticipant, ({ one }) => ({
  booking: one(courtBooking, {
    fields: [courtBookingParticipant.bookingId],
    references: [courtBooking.id],
  }),
  user: one(user, {
    fields: [courtBookingParticipant.userId],
    references: [user.id],
  }),
}));

export const courtSettingsRelations = relations(courtSettings, ({ one }) => ({
  organization: one(organization, {
    fields: [courtSettings.organizationId],
    references: [organization.id],
  }),
}));
