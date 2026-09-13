import { Context } from "hono";
import { and, count, eq, gte } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseEnrollment, court, courtBooking, user } from "../../../db/schema";

/** Read-only, for the mobile "Mes cours" view — courses the current user is enrolled in,
 * with sessions-remaining computed from not-yet-passed confirmed occurrences. */
export const listMyEnrollments = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

  const enrollments = await db
    .select({
      courseId: course.id,
      name: course.name,
      weekday: course.weekday,
      startTime: course.startTime,
      durationMinutes: course.durationMinutes,
      endDate: course.endDate,
      status: course.status,
      coachName: user.name,
      courtName: court.name,
    })
    .from(courseEnrollment)
    .innerJoin(course, eq(courseEnrollment.courseId, course.id))
    .innerJoin(user, eq(course.coachUserId, user.id))
    .innerJoin(court, eq(course.courtId, court.id))
    .where(eq(courseEnrollment.userId, currentUser.id));

  const withSessionsRemaining = await Promise.all(
    enrollments.map(async (row) => {
      const [result] = await db
        .select({ count: count() })
        .from(courtBooking)
        .where(
          and(
            eq(courtBooking.courseId, row.courseId),
            eq(courtBooking.status, "confirmed"),
            gte(courtBooking.startAt, new Date()),
          ),
        );
      return { ...row, sessionsRemaining: result?.count ?? 0 };
    }),
  );

  return c.json({ courses: withSessionsRemaining });
};
