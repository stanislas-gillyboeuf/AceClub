import { Context } from "hono";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseEnrollment, court, courtBooking, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getCourseDetailValidator } from "../validators";

export const getCourseDetail = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getCourseDetailValidator>;

  const [row] = await db
    .select({
      id: course.id,
      organizationId: course.organizationId,
      name: course.name,
      weekday: course.weekday,
      startTime: course.startTime,
      durationMinutes: course.durationMinutes,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status,
      coachUserId: course.coachUserId,
      coachName: user.name,
      courtId: course.courtId,
      courtName: court.name,
    })
    .from(course)
    .innerJoin(user, eq(course.coachUserId, user.id))
    .innerJoin(court, eq(course.courtId, court.id))
    .where(eq(course.id, validated.courseId))
    .limit(1);

  if (!row) {
    return c.json({ error: "NotFound", message: "Course not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, row.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [roster, occurrences] = await Promise.all([
    db
      .select({
        userId: courseEnrollment.userId,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(courseEnrollment)
      .innerJoin(user, eq(courseEnrollment.userId, user.id))
      .where(eq(courseEnrollment.courseId, validated.courseId)),
    db
      .select({
        id: courtBooking.id,
        startAt: courtBooking.startAt,
        endAt: courtBooking.endAt,
        status: courtBooking.status,
        kind: courtBooking.kind,
        cancellationReason: courtBooking.cancellationReason,
      })
      .from(courtBooking)
      .where(eq(courtBooking.courseId, validated.courseId))
      .orderBy(asc(courtBooking.startAt)),
  ]);

  return c.json({ course: row, roster, occurrences });
};
