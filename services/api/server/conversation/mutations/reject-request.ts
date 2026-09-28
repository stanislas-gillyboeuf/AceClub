import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { eq, and } from "drizzle-orm";

export const rejectConversationRequest = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");

  const [myParticipation] = await db
    .select({ id: conversationParticipant.id })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, currentUser.id),
      ),
    )
    .limit(1);

  if (!myParticipation) {
    return c.json({ error: "NotFound", message: "Not found" }, 404);
  }

  const [conv] = await db
    .select({ status: conversation.status, initiatedByUserId: conversation.initiatedByUserId })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv) {
    return c.json({ error: "NotFound", message: "Not found" }, 404);
  }

  if (conv.status !== "pending_request") {
    // Nothing to reject once the conversation is active (or already rejected).
    return c.json({ conversationId, status: conv.status });
  }

  if (conv.initiatedByUserId === currentUser.id) {
    return c.json(
      { error: "BadRequest", message: "Only the recipient can reject this request" },
      400,
    );
  }

  await db
    .update(conversation)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(conversation.id, conversationId));

  return c.json({ conversationId, status: "rejected" });
};
