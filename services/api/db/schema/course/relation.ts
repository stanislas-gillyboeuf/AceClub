import { relations } from "drizzle-orm";
import { course, courseEnrollment } from "./schema";
import { organization, user } from "../auth/schema";
import { court } from "../court/schema";

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
