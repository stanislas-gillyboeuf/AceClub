import { relations } from "drizzle-orm";
import { course, courseAttendance, courseEnrollment } from "./schema";
import { organization, user } from "../auth/schema";
import { court, courtBooking } from "../court/schema";

export const courseRelations = relations(course, ({ one, many }) => ({
  organization: one(organization, {
    fields: [course.organizationId],
    references: [organization.id],
  }),
  coach: one(user, {
    fields: [course.coachUserId],
    references: [user.id],
  }),
  court: one(court, {
    fields: [course.courtId],
    references: [court.id],
  }),
  enrollments: many(courseEnrollment),
}));

export const courseEnrollmentRelations = relations(courseEnrollment, ({ one }) => ({
  course: one(course, {
    fields: [courseEnrollment.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [courseEnrollment.userId],
    references: [user.id],
  }),
}));

export const courseAttendanceRelations = relations(courseAttendance, ({ one }) => ({
  booking: one(courtBooking, {
    fields: [courseAttendance.bookingId],
    references: [courtBooking.id],
  }),
  user: one(user, {
    fields: [courseAttendance.userId],
    references: [user.id],
  }),
  markedBy: one(user, {
    fields: [courseAttendance.markedByUserId],
    references: [user.id],
  }),
}));
