import { profileShareToken, userBlock, userReport } from "./schema";

export type UserBlock = typeof userBlock.$inferSelect;
export type NewUserBlock = typeof userBlock.$inferInsert;
export type UserReport = typeof userReport.$inferSelect;
export type NewUserReport = typeof userReport.$inferInsert;
export type UserReportStatusType = "open" | "reviewed" | "dismissed";
export type ProfileShareToken = typeof profileShareToken.$inferSelect;
export type NewProfileShareToken = typeof profileShareToken.$inferInsert;
