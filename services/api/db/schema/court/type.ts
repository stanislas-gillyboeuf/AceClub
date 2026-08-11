import { court, courtBooking } from "./schema";

export type Court = typeof court.$inferSelect;
export type NewCourt = typeof court.$inferInsert;
export type CourtBooking = typeof courtBooking.$inferSelect;
export type NewCourtBooking = typeof courtBooking.$inferInsert;

export type CourtSurfaceType = "clay" | "hard" | "grass" | "carpet";
export type CourtBookingStatusType = "confirmed" | "cancelled";
