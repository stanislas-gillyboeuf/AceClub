import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
  message,
  messageReaction,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { member, organization } from "../../../db/schema/auth/schema";
import { matchRequest as matchRequestTable } from "../../../db/schema/match_intents/schema";
import { eq, and, desc, lt, inArray } from "drizzle-orm";
import { decryptMessageContent } from "../lib/decrypt-content";

export const listMessages = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");
  const beforeParam = c.req.query("before");
  const limitParam = c.req.query("limit");

  const limit = Math.min(Math.max(parseInt(limitParam || "50", 10), 1), 100);
  const before = beforeParam ? new Date(beforeParam) : undefined;

  // Build query conditions
  const conditions = [eq(message.conversationId, conversationId), eq(message.isDeleted, false)];

  if (before) {
    conditions.push(lt(message.createdAt, before));
  }

  // Run participation check, encryption key fetch, and message fetch in parallel
  const [participationResult, convResult, messages] = await Promise.all([
    db
      .select({ id: conversationParticipant.id })
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, currentUser.id),
        ),
      )
      .limit(1),
    db
      .select({ encryptionKey: conversation.encryptionKey })
      .from(conversation)
      .where(eq(conversation.id, conversationId))
      .limit(1),
    db
      .select({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: user.name,
        senderImage: user.image,
        content: message.content,
        createdAt: message.createdAt,
        clientMessageId: message.clientMessageId,
        isEncrypted: message.isEncrypted,
        messageType: message.type,
        attachmentUrl: message.attachmentUrl,
        attachmentDuration: message.attachmentDuration,
        attachmentWidth: message.attachmentWidth,
        attachmentHeight: message.attachmentHeight,
        replyToId: message.replyToId,
        matchRequestId: message.matchRequestId,
      })
      .from(message)
      .innerJoin(user, eq(message.senderId, user.id))
      .where(and(...conditions))
      .orderBy(desc(message.createdAt))
      .limit(limit),
  ]);

  if (participationResult.length === 0) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }

  const encryptionKey = convResult[0]?.encryptionKey ?? null;

  // Batch-fetch replied-to messages
  const replyToIds = messages.map((m) => m.replyToId).filter((id): id is string => id !== null);

  const replyToMap = new Map<
    string,
    {
      id: string;
      senderId: string;
      senderName: string | null;
      content: string;
      messageType: string;
    }
  >();

  if (replyToIds.length > 0) {
    const repliedMessages = await db
      .select({
        id: message.id,
        senderId: message.senderId,
        senderName: user.name,
        content: message.content,
        messageType: message.type,
      })
      .from(message)
      .innerJoin(user, eq(message.senderId, user.id))
      .where(inArray(message.id, replyToIds));

    for (const rm of repliedMessages) {
      replyToMap.set(rm.id, rm);
    }
  }

  // Batch-fetch reactions for all messages
  const messageIds = messages.map((m) => m.id);
  const reactionsMap = new Map<
    string,
    { emoji: string; count: number; users: { id: string; name: string }[]; hasReacted: boolean }[]
  >();

  if (messageIds.length > 0) {
    const reactions = await db
      .select({
        id: messageReaction.id,
        messageId: messageReaction.messageId,
        emoji: messageReaction.emoji,
        userId: messageReaction.userId,
        userName: user.name,
      })
      .from(messageReaction)
      .innerJoin(user, eq(messageReaction.userId, user.id))
      .where(inArray(messageReaction.messageId, messageIds));

    // Group reactions by message, then by emoji
    for (const r of reactions) {
      if (!reactionsMap.has(r.messageId)) {
        reactionsMap.set(r.messageId, []);
      }
      const groups = reactionsMap.get(r.messageId)!;
      let group = groups.find((g) => g.emoji === r.emoji);
      if (!group) {
        group = { emoji: r.emoji, count: 0, users: [], hasReacted: false };
        groups.push(group);
      }
      group.count++;
      group.users.push({ id: r.userId, name: r.userName || "Unknown" });
      if (r.userId === currentUser.id) {
        group.hasReacted = true;
      }
    }
  }

  // Batch-fetch live match_request status + requester mini-profile for match_request messages
  const matchRequestIds = messages
    .filter((m) => m.messageType === "match_request" && m.matchRequestId)
    .map((m) => m.matchRequestId as string);

  const matchRequestMap = new Map<
    string,
    { id: string; status: string; slotIndex: number | null; receiverId: string }
  >();
  const requesterProfileMap = new Map<
    string,
    { sport: string | null; skillLevel: string | null; organizationName: string | null }
  >();

  if (matchRequestIds.length > 0) {
    const requestRows = await db
      .select({
        id: matchRequestTable.id,
        status: matchRequestTable.status,
        slotIndex: matchRequestTable.slotIndex,
        receiverId: matchRequestTable.receiverId,
        requesterId: matchRequestTable.requesterId,
      })
      .from(matchRequestTable)
      .where(inArray(matchRequestTable.id, matchRequestIds));

    for (const r of requestRows) {
      matchRequestMap.set(r.id, { id: r.id, status: r.status, slotIndex: r.slotIndex, receiverId: r.receiverId });
    }

    const requesterIds = [...new Set(requestRows.map((r) => r.requesterId))];
    if (requesterIds.length > 0) {
      const profileRows = await db
        .select({
          userId: userPreference.userId,
          sport: userPreference.sport,
          skillLevel: userPreference.skillLevel,
          organizationName: organization.name,
        })
        .from(userPreference)
        .leftJoin(member, eq(userPreference.userId, member.userId))
        .leftJoin(organization, eq(member.organizationId, organization.id))
        .where(inArray(userPreference.userId, requesterIds));

      for (const p of profileRows) {
        if (!requesterProfileMap.has(p.userId)) {
          requesterProfileMap.set(p.userId, {
            sport: p.sport,
            skillLevel: p.skillLevel,
            organizationName: p.organizationName,
          });
        }
      }
    }
  }

  return c.json(
    messages.map((msg) => {
      const repliedTo = msg.replyToId ? replyToMap.get(msg.replyToId) : null;

      // Decrypt server-side so all clients can read regardless of expo-crypto support
      const decryptedContent = msg.isEncrypted
        ? decryptMessageContent(msg.content, encryptionKey)
        : msg.content;

      const decryptedReplyContent = repliedTo?.content
        ? decryptMessageContent(repliedTo.content, encryptionKey)
        : repliedTo?.content;

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        sender: {
          id: msg.senderId,
          name: msg.senderName,
          image: msg.senderImage,
        },
        content: decryptedContent,
        createdAt: msg.createdAt.toISOString(),
        clientMessageId: msg.clientMessageId,
        isFromMe: msg.senderId === currentUser.id,
        isEncrypted: false,
        messageType: msg.messageType,
        attachmentUrl: msg.attachmentUrl,
        attachmentDuration: msg.attachmentDuration,
        attachmentWidth: msg.attachmentWidth,
        attachmentHeight: msg.attachmentHeight,
        replyToId: msg.replyToId,
        matchRequestId: msg.matchRequestId,
        matchRequest:
          msg.messageType === "match_request" && msg.matchRequestId
            ? (() => {
                const request = matchRequestMap.get(msg.matchRequestId);
                const profile = requesterProfileMap.get(msg.senderId);
                return request
                  ? {
                      id: request.id,
                      status: request.status,
                      slotIndex: request.slotIndex,
                      isReceiver: request.receiverId === currentUser.id,
                      requesterSport: profile?.sport ?? null,
                      requesterSkillLevel: profile?.skillLevel ?? null,
                      requesterOrganizationName: profile?.organizationName ?? null,
                    }
                  : null;
              })()
            : null,
        replyTo: repliedTo
          ? {
              id: repliedTo.id,
              senderId: repliedTo.senderId,
              senderName: repliedTo.senderName || "Unknown",
              content: (decryptedReplyContent ?? repliedTo.content).substring(0, 100),
              messageType: repliedTo.messageType,
            }
          : null,
        reactions: reactionsMap.get(msg.id) || [],
      };
    }),
  );
};
