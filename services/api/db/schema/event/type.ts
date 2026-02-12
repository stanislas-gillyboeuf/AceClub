import { event, eventParticipant } from "./schema";

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
export type EventParticipant = typeof eventParticipant.$inferSelect;
export type NewEventParticipant = typeof eventParticipant.$inferInsert;
