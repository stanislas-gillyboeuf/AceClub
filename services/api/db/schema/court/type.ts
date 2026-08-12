import { court, courtBooking, courtSettings } from "./schema";

export type Court = typeof court.$inferSelect;
export type NewCourt = typeof court.$inferInsert;
export type CourtBooking = typeof courtBooking.$inferSelect;
export type NewCourtBooking = typeof courtBooking.$inferInsert;
export type CourtSettings = typeof courtSettings.$inferSelect;
export type NewCourtSettings = typeof courtSettings.$inferInsert;

export type CourtSurfaceType = "clay" | "hard" | "grass" | "carpet";
export type CourtBookingStatusType = "confirmed" | "cancelled";
export type CourtAccessPolicyType = "members_only" | "open";
export type CourtCancellationPolicyType = "anytime" | "window" | "disabled";
