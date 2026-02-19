import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversationParticipant, messageReaction } from "../../../db/schema/conversation/schema";
import { eq, and, ne } from "drizzle-orm";
import { redis, CHAT_CHANNEL } from "../../../lib/redis";

export const removeReaction = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");
  const messageId = c.req.param("messageId");
  const { emoji } = await c.req.json();

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

  // Delete the reaction
  await db
    .delete(messageReaction)
    .where(
      and(
        eq(messageReaction.messageId, messageId),
        eq(messageReaction.userId, currentUser.id),
        eq(messageReaction.emoji, emoji),
      ),
    );

  // Broadcast via Redis to other participants
  const otherParticipants = await db
    .select({ userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        ne(conversationParticipant.userId, currentUser.id),
      ),
    );

  const reactionPayload = {
    type: "reaction_removed",
    messageId,
    conversationId,
    emoji,
    userId: currentUser.id,
  };

  if (redis) {
    for (const participant of otherParticipants) {
      await redis.publish(
        CHAT_CHANNEL,
        JSON.stringify({
          userId: participant.userId,
          payload: reactionPayload,
        }),
      );
    }
  }

  return c.json({ success: true });
};
