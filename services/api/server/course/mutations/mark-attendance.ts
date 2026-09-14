import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseAttendance, courseEnrollment, courtBooking } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { markAttendanceValidator } from "../validators";

export const markAttendance = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof markAttendanceValidator>;

  const [booking] = await db
    .select({ id: courtBooking.id, courseId: courtBooking.courseId })
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

  const [enrolled] = await db
    .select({ id: courseEnrollment.id })
    .from(courseEnrollment)
    .where(
      and(eq(courseEnrollment.courseId, parentCourse.id), eq(courseEnrollment.userId, validated.userId)),
    )
    .limit(1);

  if (!enrolled) {
    return c.json({ error: "BadRequest", message: "This user is not enrolled in this course" }, 400);
  }

  const [marked] = await db
    .insert(courseAttendance)
    .values({
      bookingId: validated.bookingId,
      userId: validated.userId,
      status: validated.status,
      markedByUserId: currentUser.id,
    })
    .onConflictDoUpdate({
      target: [courseAttendance.bookingId, courseAttendance.userId],
      set: { status: validated.status, markedByUserId: currentUser.id, markedAt: new Date() },
    })
    .returning();

  return c.json(marked);
};
