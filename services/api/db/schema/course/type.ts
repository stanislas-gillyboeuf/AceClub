import { course, courseEnrollment } from "./schema";

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;
export type CourseEnrollment = typeof courseEnrollment.$inferSelect;
export type CourseStatusType = "active" | "cancelled";
