import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, court } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { createCourseValidator } from "../validators";
import {
  CourseConflictError,
  computeOccurrenceSlots,
  insertOccurrences,
} from "../lib/occurrence-generator";
import { getVacationDateRanges } from "../../vacation-period/lib/get-periods";

export const createCourse = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createCourseValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [targetCourt] = await db
    .select({ id: court.id, organizationId: court.organizationId })
    .from(court)
    .where(eq(court.id, validated.courtId))
    .limit(1);

  if (!targetCourt || targetCourt.organizationId !== validated.organizationId) {
    return c.json({ error: "NotFound", message: "Court not found" }, 404);
  }

  const coachIsMember = await isOrgMember(validated.coachUserId, validated.organizationId);
  if (!coachIsMember) {
    return c.json({ error: "BadRequest", message: "Coach must be a member of this club" }, 400);
  }

  if (validated.endDate < validated.startDate) {
    return c.json({ error: "BadRequest", message: "endDate must be on or after startDate" }, 400);
  }

  const vacationPeriods = await getVacationDateRanges(validated.organizationId);

  const slots = computeOccurrenceSlots({
    weekday: validated.weekday,
    startTime: validated.startTime,
    durationMinutes: validated.durationMinutes,
    startDate: validated.startDate,
    endDate: validated.endDate,
    vacationPeriods,
  });

  if (slots.length === 0) {
    return c.json(
      { error: "BadRequest", message: "No sessions fall within the given date range" },
      400,
    );
  }

  try {
    const created = await db.transaction(async (tx) => {
      const [newCourse] = await tx
        .insert(course)
        .values({
          organizationId: validated.organizationId,
          coachUserId: validated.coachUserId,
          courtId: validated.courtId,
          name: validated.name,
          weekday: validated.weekday,
          startTime: validated.startTime,
          durationMinutes: validated.durationMinutes,
          startDate: new Date(`${validated.startDate}T00:00:00Z`),
          endDate: new Date(`${validated.endDate}T00:00:00Z`),
        })
        .returning();

      await insertOccurrences(tx, {
        courtId: validated.courtId,
        courseId: newCourse.id,
        coachUserId: validated.coachUserId,
        courseName: validated.name,
        slots,
      });

      return newCourse;
    });

    return c.json(created, 201);
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
