import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courtBooking } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { cancelOccurrenceValidator } from "../validators";

export const cancelOccurrence = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof cancelOccurrenceValidator>;

  const [booking] = await db
    .select()
    .from(courtBooking)
    .where(eq(courtBooking.id, validated.bookingId))
    .limit(1);

  if (!booking || booking.kind !== "course" || !booking.courseId) {
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

  // Only a club admin can reopen the slot to booking — a coach cancelling their own session
  // just marks it unavailable, they can't unilaterally free up the court.
  if (validated.reopen && !isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Only a club admin can reopen this slot" }, 403);
  }

  if (booking.status !== "confirmed") {
    return c.json({ error: "BadRequest", message: "This session is already cancelled" }, 400);
  }

  if (booking.startAt.getTime() < Date.now()) {
    return c.json({ error: "BadRequest", message: "Cannot cancel a past session" }, 400);
  }

  if (validated.reopen) {
    await db
      .update(courtBooking)
      .set({ status: "cancelled", cancellationReason: validated.reason ?? null })
      .where(eq(courtBooking.id, booking.id));
  } else {
    await db
      .update(courtBooking)
      .set({
        kind: "admin_block",
        purpose: validated.reason ?? `Cours annulé — ${parentCourse.name}`,
        cancellationReason: validated.reason ?? null,
      })
      .where(eq(courtBooking.id, booking.id));
  }

  return c.json({ success: true });
};
