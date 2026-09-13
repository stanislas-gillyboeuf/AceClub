import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { course, courseEnrollment } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { enrollMemberValidator } from "../validators";

export const enrollMember = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof enrollMemberValidator>;

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

  const memberExists = await isOrgMember(validated.userId, existing.organizationId);
  if (!memberExists) {
    return c.json({ error: "BadRequest", message: "This user is not a member of this club" }, 400);
  }

  try {
    const [created] = await db
      .insert(courseEnrollment)
      .values({ courseId: validated.courseId, userId: validated.userId })
      .returning();
    return c.json(created, 201);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "23505") {
      return c.json({ error: "Conflict", message: "Already enrolled" }, 409);
    }
    throw error;
  }
};
