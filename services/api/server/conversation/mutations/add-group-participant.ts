import type { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { isOrgMember } from "../../../middleware/org-member";
import { addGroupParticipantValidator } from "../validators";

/** The only way back into a group someone deliberately left — the coach (course group) or any
 * group admin (manual group) re-adds them explicitly. Also covers "never was a member". */
export const addGroupParticipant = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const conversationId = c.req.param("id");
  // @ts-ignore
  const { userId } = c.req.valid("json") as z.infer<typeof addGroupParticipantValidator>;

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
    .select({ type: conversation.type, organizationId: conversation.organizationId })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv || conv.type !== "group") {
    return c.json({ error: "NotFound", message: "Group not found" }, 404);
  }

  if (conv.organizationId && !(await isOrgMember(userId, conv.organizationId))) {
    return c.json({ error: "BadRequest", message: "Not a member of this club" }, 400);
  }

  const [existing] = await db
    .select()
    .from(conversationParticipant)
    .where(and(eq(conversationParticipant.conversationId, conversationId), eq(conversationParticipant.userId, userId)))
    .limit(1);

  if (existing) {
    await db
      .update(conversationParticipant)
      .set({ isDeleted: false, deletedAt: null, leftManually: false })
      .where(eq(conversationParticipant.id, existing.id));
  } else {
    await db.insert(conversationParticipant).values({
      id: ulid(),
      conversationId,
      userId,
      isAdmin: false,
      joinedAt: new Date(),
    });
  }

  return c.json({ success: true });
};
