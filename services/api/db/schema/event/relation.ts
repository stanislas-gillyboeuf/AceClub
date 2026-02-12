import { relations } from "drizzle-orm";
import { event, eventParticipant } from "./schema";
import { organization, user } from "../auth/schema";

export const eventRelations = relations(event, ({ one, many }) => ({
  user: one(user, {
    fields: [event.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [event.organizationId],
    references: [organization.id],
  }),
  participants: many(eventParticipant),
}));

export const eventParticipantRelations = relations(eventParticipant, ({ one }) => ({
  event: one(event, {
    fields: [eventParticipant.eventId],
    references: [event.id],
  }),
  user: one(user, {
    fields: [eventParticipant.userId],
    references: [user.id],
  }),
}));
