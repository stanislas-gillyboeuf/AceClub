import { duesType, duesAssignment, duesReminderLog } from "./schema";

export type DuesType = typeof duesType.$inferSelect;
export type NewDuesType = typeof duesType.$inferInsert;
export type DuesAssignment = typeof duesAssignment.$inferSelect;
export type NewDuesAssignment = typeof duesAssignment.$inferInsert;
export type DuesReminderLog = typeof duesReminderLog.$inferSelect;

export type DuesAssignmentStatusType = "pending" | "paid" | "waived";
