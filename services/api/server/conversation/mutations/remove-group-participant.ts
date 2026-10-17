import type { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { course } from "../../../db/schema/course/schema";
import { addGroupParticipantValidator } from "../validators";

/** Admin removes someone from a manual or course group. Marked leftManually so a course
 * group's next sync (still-enrolled student) never silently brings them back — same rule as a
 * deliberate self-leave; only add-group-participant undoes it. */
export const removeGroupParticipant = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const conversationId = c.req.param("id");
  // @ts-ignore
  const { userId } = c.req.valid("json") as z.infer<typeof addGroupParticipantValidator>;

  if (userId === currentUser.id) {
    return c.json({ error: "BadRequest", message: "Use leave instead of removing yourself" }, 400);
  }

  const [myParticipation] = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, currentUser.id),
      ),
    )
    .limit(1);

  if (!myParticipation || !myParticipation.isAdmin) {
    return c.json({ error: "Forbidden", message: "Group admin required" }, 403);
  }

  const [conv] = await db
    .select({ type: conversation.type, courseId: conversation.courseId })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv || conv.type !== "group") {
    return c.json({ error: "NotFound", message: "Group not found" }, 404);
  }

  if (conv.courseId) {
    const [courseRow] = await db
      .select({ coachUserId: course.coachUserId })
      .from(course)
      .where(eq(course.id, conv.courseId))
      .limit(1);
    if (courseRow?.coachUserId === userId) {
      return c.json(
        { error: "BadRequest", message: "Reassign the course's coach instead of removing them" },
        400,
      );
    }
  }

  const [target] = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(eq(conversationParticipant.conversationId, conversationId), eq(conversationParticipant.userId, userId)),
    )
    .limit(1);

  if (!target || target.isDeleted) {
    return c.json({ error: "NotFound", message: "Participant not found" }, 404);
  }

  await db
    .update(conversationParticipant)
    .set({ isDeleted: true, deletedAt: new Date(), leftManually: true, unreadCount: 0 })
    .where(eq(conversationParticipant.id, target.id));

  return c.json({ success: true });
};
