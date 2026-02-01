import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
  message,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { ulid } from "ulid";
import { redis, CHAT_CHANNEL } from "../../../lib/redis";
import { sendNotificationToUser } from "../../../services/apns/notification-service";
import { isUserConnectedWs } from "../../ws/bun-chat-handler";

export const sendMessage = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");
  const body = await c.req.json();
  const { content, clientMessageId } = body;

  // Verify user is a participant
  const [myParticipation] = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, currentUser.id)
      )
    )
    .limit(1);

  if (!myParticipation) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }

  // If conversation was deleted by this user, restore it
  if (myParticipation.isDeleted) {
    await db
      .update(conversationParticipant)
      .set({ isDeleted: false, deletedAt: null })
      .where(eq(conversationParticipant.id, myParticipation.id));
  }

  // Get sender name for the message
  const [sender] = await db
    .select({ name: user.name, image: user.image })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

  // Insert the message
  const messageId = ulid();
  const now = new Date();

  const [newMessage] = await db
    .insert(message)
    .values({
      id: messageId,
      conversationId,
      senderId: currentUser.id,
      content,
      clientMessageId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Update conversation with last message info
  await db
    .update(conversation)
    .set({
      lastMessageAt: now,
      lastMessagePreview: content.substring(0, 100),
      lastMessageSenderId: currentUser.id,
      updatedAt: now,
    })
    .where(eq(conversation.id, conversationId));

  // Get other participants to notify
  const otherParticipants = await db
    .select({
      id: conversationParticipant.id,
      userId: conversationParticipant.userId,
      isMuted: conversationParticipant.isMuted,
      isDeleted: conversationParticipant.isDeleted,
    })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        ne(conversationParticipant.userId, currentUser.id)
      )
    );

  // Increment unread count for other participants and restore if deleted
  for (const participant of otherParticipants) {
    await db
      .update(conversationParticipant)
      .set({
        unreadCount: sql`${conversationParticipant.unreadCount} + 1`,
        // Restore conversation if it was deleted (new message brings it back)
        isDeleted: false,
        deletedAt: null,
      })
      .where(eq(conversationParticipant.id, participant.id));
  }

  // Prepare message payload for WebSocket broadcast
  const messagePayload = {
    type: "new_message",
    message: {
      id: newMessage.id,
      conversationId,
      senderId: currentUser.id,
      senderName: sender?.name || "Unknown",
      senderImage: sender?.image || null,
      content,
      createdAt: newMessage.createdAt.toISOString(),
      clientMessageId,
    },
  };

  // Broadcast via Redis to all server instances
  if (redis) {
    for (const participant of otherParticipants) {
      await redis.publish(
        CHAT_CHANNEL,
        JSON.stringify({
          userId: participant.userId,
          payload: messagePayload,
        })
      );
    }
  }

  for (const participant of otherParticipants) {
    if (!participant.isMuted) {
      if (isUserConnectedWs(participant.userId)) {
        continue;
      }

      try {
        await sendNotificationToUser({
          userId: participant.userId,
          type: "new_message",
          title: sender?.name || "Nouveau message",
          body: content.substring(0, 100),
          referenceId: conversationId,
          referenceType: "conversation",
          data: {
            conversationId,
            messageId: newMessage.id,
          },
        });
      } catch (error) {
        console.error(
          `[SendMessage] Failed to send push notification to user ${participant.userId}:`,
          error
        );
      }
    }
  }

  return c.json(
    {
      id: newMessage.id,
      conversationId,
      senderId: currentUser.id,
      senderName: sender?.name || "Unknown",
      senderImage: sender?.image || null,
      content,
      createdAt: newMessage.createdAt.toISOString(),
      clientMessageId,
      isFromMe: true,
    },
    201
  );
};
