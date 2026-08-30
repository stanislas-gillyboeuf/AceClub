import { db } from "../../../db";
import { conversation, conversationParticipant, message } from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, ne, sql, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { redis, CHAT_CHANNEL } from "../../../lib/redis";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";
import { isUserConnectedWs } from "../../ws/bun-chat-handler";

interface MatchRequestCardInfo {
  id: string;
  status: "pending" | "accepted" | "rejected";
  slotIndex: number | null;
  isReceiver: boolean;
  requesterSport: string | null;
  requesterSkillLevel: string | null;
  requesterOrganizationName: string | null;
}

interface InsertSystemMessageParams {
  conversationId: string;
  /** The user this message is attributed to (shown as sender in the conversation). */
  senderId: string;
  type: "match_request";
  /** Static preview text — used for the conversation list and push notification body. */
  content: string;
  matchRequestId?: string;
  /** Rendered inline by the client for match_request messages — from the receiver's point of view. */
  matchRequestInfo?: MatchRequestCardInfo;
  notificationTitle: string;
}

/**
 * Inserts a system-generated message (e.g. a match_request card) and runs the same
 * side-effect pipeline as a regular user message: conversation preview/unreadCount
 * update, WebSocket broadcast, and push notification. Kept separate from
 * mutations/send-message.ts (which also handles E2EE/replies/attachments from a raw
 * HTTP body) to avoid risking regressions in that heavily-used path.
 */
export async function insertSystemMessage(params: InsertSystemMessageParams) {
  const { conversationId, senderId, type, content, matchRequestId, matchRequestInfo, notificationTitle } = params;

  const [[sender]] = await Promise.all([
    db.select({ name: user.name, image: user.image }).from(user).where(eq(user.id, senderId)).limit(1),
  ]);

  const messageId = ulid();
  const now = new Date();

  const [newMessage] = await db
    .insert(message)
    .values({
      id: messageId,
      conversationId,
      senderId,
      content,
      type,
      matchRequestId: matchRequestId ?? null,
      isEncrypted: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await db
    .update(conversation)
    .set({ lastMessageAt: now, lastMessagePreview: content, lastMessageSenderId: senderId, updatedAt: now })
    .where(eq(conversation.id, conversationId));

  const otherParticipants = await db
    .select({
      id: conversationParticipant.id,
      userId: conversationParticipant.userId,
      isMuted: conversationParticipant.isMuted,
    })
    .from(conversationParticipant)
    .where(and(eq(conversationParticipant.conversationId, conversationId), ne(conversationParticipant.userId, senderId)));

  const otherParticipantIds = otherParticipants.map((p) => p.id);
  if (otherParticipantIds.length > 0) {
    await db
      .update(conversationParticipant)
      .set({ unreadCount: sql`${conversationParticipant.unreadCount} + 1`, isDeleted: false, deletedAt: null })
      .where(inArray(conversationParticipant.id, otherParticipantIds));
  }

  const messagePayload = {
    type: "new_message",
    message: {
      id: newMessage.id,
      conversationId,
      sender: { id: senderId, name: sender?.name || "Unknown", image: sender?.image || null },
      content,
      createdAt: newMessage.createdAt.toISOString(),
      isEncrypted: false,
      messageType: type,
      matchRequestId: matchRequestId ?? null,
      matchRequest: matchRequestInfo ?? null,
    },
  };

  if (redis) {
    try {
      await Promise.all(
        otherParticipants.map((p) => redis?.publish(CHAT_CHANNEL, JSON.stringify({ userId: p.userId, payload: messagePayload }))),
      );
    } catch {
      console.warn("[insert-message] Redis publish failed, skipping broadcast");
    }
  }

  Promise.all(
    otherParticipants
      .filter((p) => !p.isMuted && !isUserConnectedWs(p.userId))
      .map((p) =>
        sendNotificationToUser({
          userId: p.userId,
          type: "new_message",
          title: notificationTitle,
          body: content,
          referenceId: conversationId,
          referenceType: "conversation",
          data: { conversationId, messageId: newMessage.id },
        }).catch((error) => console.error(`[insert-message] Failed to notify user ${p.userId}:`, error)),
      ),
  ).catch(() => {});

  return {
    id: newMessage.id,
    conversationId,
    sender: { id: senderId, name: sender?.name || "Unknown", image: sender?.image || null },
    content,
    createdAt: newMessage.createdAt.toISOString(),
    isEncrypted: false,
    messageType: type,
    matchRequestId: matchRequestId ?? null,
    matchRequest: matchRequestInfo ?? null,
  };
}
