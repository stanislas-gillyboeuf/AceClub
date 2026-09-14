import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseAttendance, courseEnrollment, courtBooking, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOccurrenceAttendanceValidator } from "../validators";

export const getOccurrenceAttendance = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getOccurrenceAttendanceValidator>;

  const [booking] = await db
    .select({ id: courtBooking.id, courseId: courtBooking.courseId, startAt: courtBooking.startAt })
    .from(courtBooking)
    .where(eq(courtBooking.id, validated.bookingId))
    .limit(1);

  if (!booking || !booking.courseId) {
    return c.json({ error: "NotFound", message: "Course occurrence not found" }, 404);
  }

  const [parentCourse] = await db
    .select()
    .from(course)
    .where(eq(course.id, booking.courseId))
    .limit(1);

  if (!parentCourse) {
    return c.json({ error: "NotFound", message: "Course not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, parentCourse.organizationId);
  const isAssignedCoach = currentUser.id === parentCourse.coachUserId;
  if (!isFullAdmin && !isAssignedCoach) {
    return c.json({ error: "Forbidden", message: "Not authorized for this course" }, 403);
  }

  const roster = await db
    .select({
      userId: courseEnrollment.userId,
      name: user.name,
      image: user.image,
      status: courseAttendance.status,
    })
    .from(courseEnrollment)
    .innerJoin(user, eq(courseEnrollment.userId, user.id))
    .leftJoin(
      courseAttendance,
      and(
        eq(courseAttendance.userId, courseEnrollment.userId),
        eq(courseAttendance.bookingId, validated.bookingId),
      ),
    )
    .where(eq(courseEnrollment.courseId, parentCourse.id));

  return c.json({ bookingId: booking.id, startAt: booking.startAt, roster });
};
