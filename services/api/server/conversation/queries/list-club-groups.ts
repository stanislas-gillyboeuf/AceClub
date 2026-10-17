import type { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation } from "../../../db/schema/conversation/schema";
import { course } from "../../../db/schema/course/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listClubGroupsValidator } from "../validators";

/** Dashboard listing — every group belonging to this club, course-tied or manual. */
export const listClubGroups = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const { organizationId } = c.req.valid("query") as z.infer<typeof listClubGroupsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const rows = await db
    .select({
      id: conversation.id,
      name: conversation.name,
      courseId: conversation.courseId,
      courseName: course.name,
      isArchived: conversation.isArchived,
      announcementsOnly: conversation.announcementsOnly,
      createdAt: conversation.createdAt,
    })
    .from(conversation)
    .leftJoin(course, eq(conversation.courseId, course.id))
    .where(and(eq(conversation.organizationId, organizationId), eq(conversation.type, "group")));

  return c.json(rows);
};
