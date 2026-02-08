import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversationParticipant } from "../../../db/schema/conversation/schema";
import { eq, and } from "drizzle-orm";

export const deleteConversation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");

  // Verify user is a participant
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

  if (!myParticipation) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }

  // Soft delete - only for this participant
  // The other participant keeps their history
  // If a new message is sent, the conversation will reappear for this user
  await db
    .update(conversationParticipant)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      // Also reset unread count since the user is "leaving" the conversation
      unreadCount: 0,
    })
    .where(eq(conversationParticipant.id, myParticipation.id));

  return c.json({ success: true });
};
