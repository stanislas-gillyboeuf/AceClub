import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversationParticipant,
  message,
  messageReaction,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, ne } from "drizzle-orm";
import { ulid } from "ulid";
import { redis, CHAT_CHANNEL } from "../../../lib/redis";

export const addReaction = async (c: Context<HonoContext>) => {
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

  // Verify message exists and is not deleted
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

  // Upsert reaction (INSERT ... ON CONFLICT DO NOTHING)
  await db
    .insert(messageReaction)
    .values({
      id: ulid(),
      messageId,
      userId: currentUser.id,
      emoji,
    })
    .onConflictDoNothing({
      target: [messageReaction.messageId, messageReaction.userId, messageReaction.emoji],
    });

  // Fetch current user name
  const [currentUserInfo] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

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
    type: "new_reaction",
    messageId,
    conversationId,
    emoji,
    user: {
      id: currentUser.id,
      name: currentUserInfo?.name || "Unknown",
    },
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

  // Fetch all reactions grouped for this message
  const reactions = await db
    .select({
      emoji: messageReaction.emoji,
      userId: messageReaction.userId,
      userName: user.name,
    })
    .from(messageReaction)
    .innerJoin(user, eq(messageReaction.userId, user.id))
    .where(eq(messageReaction.messageId, messageId));

  // Group reactions by emoji
  const groups: {
    emoji: string;
    count: number;
    users: { id: string; name: string }[];
    hasReacted: boolean;
  }[] = [];
  for (const r of reactions) {
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

  return c.json({ reactions: groups }, 201);
};
