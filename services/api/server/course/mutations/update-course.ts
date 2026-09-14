import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, court } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { updateCourseValidator } from "../validators";
import {
  CourseConflictError,
  cancelFutureOccurrences,
  computeOccurrenceSlots,
  insertOccurrences,
} from "../lib/occurrence-generator";
import { getVacationDateRanges } from "../../vacation-period/lib/get-periods";

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Permanent change to a course's schedule/coach/court/end date — no "this and following" partial
 * edit (out of scope). Cancels every not-yet-passed occurrence of the OLD definition and
 * regenerates from today forward under the NEW definition; past sessions are never touched.
 */
export const updateCourse = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateCourseValidator>;

  const [existing] = await db
    .select()
    .from(course)
    .where(eq(course.id, validated.courseId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Course not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (existing.status === "cancelled") {
    return c.json({ error: "BadRequest", message: "This course has been cancelled" }, 400);
  }

  const courtId = validated.courtId ?? existing.courtId;
  if (validated.courtId) {
    const [targetCourt] = await db
      .select({ id: court.id, organizationId: court.organizationId })
      .from(court)
      .where(eq(court.id, courtId))
      .limit(1);
    if (!targetCourt || targetCourt.organizationId !== existing.organizationId) {
      return c.json({ error: "NotFound", message: "Court not found" }, 404);
    }
  }

  const coachUserId = validated.coachUserId ?? existing.coachUserId;
  if (validated.coachUserId) {
    const coachIsMember = await isOrgMember(coachUserId, existing.organizationId);
    if (!coachIsMember) {
      return c.json({ error: "BadRequest", message: "Coach must be a member of this club" }, 400);
    }
  }

  const name = validated.name ?? existing.name;
  const weekday = validated.weekday ?? existing.weekday;
  const startTime = validated.startTime ?? existing.startTime;
  const durationMinutes = validated.durationMinutes ?? existing.durationMinutes;
  const endDate = validated.endDate ?? toDateString(existing.endDate);

  const today = toDateString(new Date());
  const effectiveStartDate = today > toDateString(existing.startDate) ? today : toDateString(existing.startDate);

  if (endDate < effectiveStartDate) {
    return c.json({ error: "BadRequest", message: "endDate must be on or after today" }, 400);
  }

  const vacationPeriods = await getVacationDateRanges(existing.organizationId);

  const slots = computeOccurrenceSlots({
    weekday,
    startTime,
    durationMinutes,
    startDate: effectiveStartDate,
    endDate,
    vacationPeriods,
  });

  try {
    const updated = await db.transaction(async (tx) => {
      await cancelFutureOccurrences(tx, existing.id);

      const [updatedCourse] = await tx
        .update(course)
        .set({
          coachUserId,
          courtId,
          name,
          weekday,
          startTime,
          durationMinutes,
          endDate: new Date(`${endDate}T00:00:00Z`),
        })
        .where(eq(course.id, existing.id))
        .returning();

      await insertOccurrences(tx, {
        courtId,
        courseId: existing.id,
        coachUserId,
        courseName: name,
        slots,
        excludeCourseId: existing.id,
      });

      return updatedCourse;
    });

    return c.json(updated);
  } catch (error) {
    if (error instanceof CourseConflictError) {
      return c.json(
        { error: "Conflict", message: error.message, conflictingDates: error.conflictingDates },
        409,
      );
    }
    return c.json({ error: "InternalError", message: (error as Error).message }, 500);
  }
};
