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
  const { content, clientMessageId, isEncrypted, type: messageType, attachmentUrl, attachmentDuration, attachmentWidth, attachmentHeight, replyToId } = body;

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

  const msgType = messageType || "text";

  const [newMessage] = await db
    .insert(message)
    .values({
      id: messageId,
      conversationId,
      senderId: currentUser.id,
      content: content || "",
      type: msgType,
      attachmentUrl: attachmentUrl || null,
      attachmentDuration: attachmentDuration || null,
      attachmentWidth: attachmentWidth || null,
      attachmentHeight: attachmentHeight || null,
      clientMessageId,
      isEncrypted: isEncrypted ?? false,
      replyToId: replyToId || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Fetch replied-to message info if replyToId is provided
  let replyTo = null;
  if (replyToId) {
    const [repliedMessage] = await db
      .select({
        id: message.id,
        senderId: message.senderId,
        senderName: user.name,
        content: message.content,
        messageType: message.type,
      })
      .from(message)
      .innerJoin(user, eq(message.senderId, user.id))
      .where(and(eq(message.id, replyToId), eq(message.conversationId, conversationId)))
      .limit(1);

    if (repliedMessage) {
      replyTo = {
        id: repliedMessage.id,
        senderId: repliedMessage.senderId,
        senderName: repliedMessage.senderName || "Unknown",
        content: repliedMessage.content.substring(0, 100),
        messageType: repliedMessage.messageType,
      };
    }
  }

  // Compute last message preview based on type
  let lastMessagePreview: string | null;
  if (isEncrypted) {
    lastMessagePreview = null;
  } else if (msgType === "voice") {
    lastMessagePreview = "Message vocal";
  } else if (msgType === "image") {
    lastMessagePreview = "Photo";
  } else {
    lastMessagePreview = (content || "").substring(0, 100);
  }

  // Update conversation with last message info
  await db
    .update(conversation)
    .set({
      lastMessageAt: now,
      lastMessagePreview,
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
        ne(conversationParticipant.userId, currentUser.id),
      ),
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
      sender: {
        id: currentUser.id,
        name: sender?.name || "Unknown",
        image: sender?.image || null,
      },
      content: content || "",
      createdAt: newMessage.createdAt.toISOString(),
      clientMessageId,
      isEncrypted: newMessage.isEncrypted,
      messageType: msgType,
      attachmentUrl: attachmentUrl || null,
      attachmentDuration: attachmentDuration || null,
      attachmentWidth: attachmentWidth || null,
      attachmentHeight: attachmentHeight || null,
      replyToId: replyToId || null,
      replyTo,
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
        }),
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
          body: isEncrypted ? "Nouveau message" : (msgType === "voice" ? "Message vocal" : msgType === "image" ? "Photo" : (content || "").substring(0, 100)),
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
          error,
        );
      }
    }
  }

  return c.json(
    {
      id: newMessage.id,
      conversationId,
      sender: {
        id: currentUser.id,
        name: sender?.name || "Unknown",
        image: sender?.image || null,
      },
      content: content || "",
      createdAt: newMessage.createdAt.toISOString(),
      clientMessageId,
      isFromMe: true,
      isEncrypted: newMessage.isEncrypted,
      messageType: msgType,
      attachmentUrl: attachmentUrl || null,
      attachmentDuration: attachmentDuration || null,
      attachmentWidth: attachmentWidth || null,
      attachmentHeight: attachmentHeight || null,
      replyToId: replyToId || null,
      replyTo,
    },
    201,
  );
};
