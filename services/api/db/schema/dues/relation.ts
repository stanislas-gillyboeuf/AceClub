import { relations } from "drizzle-orm";
import { duesType, duesAssignment, duesReminderLog } from "./schema";
import { organization, user } from "../auth/schema";

export const duesTypeRelations = relations(duesType, ({ one, many }) => ({
  organization: one(organization, {
    fields: [duesType.organizationId],
    references: [organization.id],
  }),
  assignments: many(duesAssignment),
}));

export const duesAssignmentRelations = relations(duesAssignment, ({ one, many }) => ({
  duesType: one(duesType, {
    fields: [duesAssignment.duesTypeId],
    references: [duesType.id],
  }),
  user: one(user, {
    fields: [duesAssignment.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [duesAssignment.organizationId],
    references: [organization.id],
  }),
  reminders: many(duesReminderLog),
}));

export const duesReminderLogRelations = relations(duesReminderLog, ({ one }) => ({
  assignment: one(duesAssignment, {
    fields: [duesReminderLog.duesAssignmentId],
    references: [duesAssignment.id],
  }),
  sentBy: one(user, {
    fields: [duesReminderLog.sentByUserId],
    references: [user.id],
  }),
}));
