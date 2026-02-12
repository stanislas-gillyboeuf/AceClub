import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversationParticipant } from "../../../db/schema/conversation/schema";
import { eq, and, ne } from "drizzle-orm";
import { redis, CHAT_CHANNEL } from "../../../lib/redis";

export const markRead = async (c: Context<HonoContext>) => {
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

  // Update last read and reset unread count
  const now = new Date();
  await db
    .update(conversationParticipant)
    .set({
      lastReadAt: now,
      unreadCount: 0,
    })
    .where(eq(conversationParticipant.id, myParticipation.id));

  // Broadcast read receipt via Redis
  if (redis) {
    // Get other participants to notify about read status
    const otherParticipants = await db
      .select({ userId: conversationParticipant.userId })
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          ne(conversationParticipant.userId, currentUser.id),
        ),
      );

    const readPayload = {
      type: "read",
      conversationId,
      userId: currentUser.id,
      readAt: now.toISOString(),
    };

    for (const participant of otherParticipants) {
      await redis.publish(
        CHAT_CHANNEL,
        JSON.stringify({
          userId: participant.userId,
          payload: readPayload,
        }),
      );
    }
  }

  return c.json({ success: true, lastReadAt: now.toISOString() });
};
