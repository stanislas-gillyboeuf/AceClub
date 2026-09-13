import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseEnrollment } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { unenrollMemberValidator } from "../validators";

export const unenrollMember = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof unenrollMemberValidator>;

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

  await db
    .delete(courseEnrollment)
    .where(
      and(eq(courseEnrollment.courseId, validated.courseId), eq(courseEnrollment.userId, validated.userId)),
    );

  return c.json({ success: true });
};
