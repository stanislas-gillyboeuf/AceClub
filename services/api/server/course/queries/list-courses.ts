import { Context } from "hono";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, court, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listCoursesValidator } from "../validators";

export const listCourses = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listCoursesValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const rows = await db
    .select({
      id: course.id,
      name: course.name,
      weekday: course.weekday,
      startTime: course.startTime,
      durationMinutes: course.durationMinutes,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status,
      coachName: user.name,
      courtName: court.name,
    })
    .from(course)
    .innerJoin(user, eq(course.coachUserId, user.id))
    .innerJoin(court, eq(course.courtId, court.id))
    .where(eq(course.organizationId, validated.organizationId))
    .orderBy(desc(course.createdAt));

  return c.json({ courses: rows });
};
