import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant, message } from "../../../db/schema/conversation/schema";
import { eq, and } from "drizzle-orm";

export const deleteMessage = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");
  const messageId = c.req.param("messageId");

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

  // Get the message and verify ownership
  const [existingMessage] = await db
    .select()
    .from(message)
    .where(
      and(
        eq(message.id, messageId),
        eq(message.conversationId, conversationId),
        eq(message.isDeleted, false),
      ),
    )
    .limit(1);

  if (!existingMessage) {
    return c.json({ error: "NotFound", message: "Message not found" }, 404);
  }

  // The sender can always delete their own message; a group admin can delete any message
  if (existingMessage.senderId !== currentUser.id && !myParticipation.isAdmin) {
    return c.json({ error: "Forbidden", message: "You can only delete your own messages" }, 403);
  }

  // Soft delete the message
  await db
    .update(message)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
    })
    .where(eq(message.id, messageId));

  // Never leave the conversation pointing at a deleted message
  await db
    .update(conversation)
    .set({ pinnedMessageId: null })
    .where(and(eq(conversation.id, conversationId), eq(conversation.pinnedMessageId, messageId)));

  return c.json({ success: true });
};
