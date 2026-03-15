import { event, eventParticipant } from "./schema";

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
export type EventParticipant = typeof eventParticipant.$inferSelect;
export type NewEventParticipant = typeof eventParticipant.$inferInsert;

export type EventStatus = "draft" | "presale" | "on_sale" | "completed" | "full" | "cancelled" | "archived";
export type EventVisibility = "public" | "organization";
export type EventParticipantStatusType = "registered" | "waitlisted" | "cancelled";
