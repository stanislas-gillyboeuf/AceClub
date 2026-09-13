import { Context } from "hono";
import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseEnrollment, court, courtBooking, user } from "../../../db/schema";
import { assertCoach } from "../../../middleware/club-admin";
import { listMyCoursesValidator } from "../validators";

export const listMyCourses = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listMyCoursesValidator>;

  const isCoach = await assertCoach(currentUser.id, validated.organizationId);
  if (!isCoach) {
    return c.json({ error: "Forbidden", message: "Coach access required" }, 403);
  }

  const courses = await db
    .select({
      id: course.id,
      name: course.name,
      weekday: course.weekday,
      startTime: course.startTime,
      durationMinutes: course.durationMinutes,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status,
      courtName: court.name,
    })
    .from(course)
    .innerJoin(court, eq(course.courtId, court.id))
    .where(
      and(eq(course.coachUserId, currentUser.id), eq(course.organizationId, validated.organizationId)),
    );

  const withDetails = await Promise.all(
    courses.map(async (row) => {
      const [roster, occurrences] = await Promise.all([
        db
          .select({ userId: courseEnrollment.userId, name: user.name, image: user.image })
          .from(courseEnrollment)
          .innerJoin(user, eq(courseEnrollment.userId, user.id))
          .where(eq(courseEnrollment.courseId, row.id)),
        db
          .select({
            id: courtBooking.id,
            startAt: courtBooking.startAt,
            endAt: courtBooking.endAt,
            status: courtBooking.status,
            kind: courtBooking.kind,
          })
          .from(courtBooking)
          .where(eq(courtBooking.courseId, row.id))
          .orderBy(asc(courtBooking.startAt)),
      ]);
      return { ...row, roster, occurrences };
    }),
  );

  return c.json({ courses: withDetails });
};
