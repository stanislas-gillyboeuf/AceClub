import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
} from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, ne } from "drizzle-orm";

export const getConversation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");

  // Check if user is a participant
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

  // Get conversation details
  const [conv] = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv) {
    return c.json({ error: "NotFound", message: "Conversation not found" }, 404);
  }

  // Get other participants
  const otherParticipants = await db
    .select({
      id: conversationParticipant.id,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
    })
    .from(conversationParticipant)
    .innerJoin(user, eq(conversationParticipant.userId, user.id))
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        ne(conversationParticipant.userId, currentUser.id)
      )
    );

  return c.json({
    id: conv.id,
    matchId: conv.matchId,
    name: conv.name,
    type: conv.type,
    lastMessageAt: conv.lastMessageAt?.toISOString() || null,
    lastMessagePreview: conv.lastMessagePreview,
    lastMessageSenderId: conv.lastMessageSenderId,
    createdAt: conv.createdAt.toISOString(),
    unreadCount: myParticipation.unreadCount,
    isMuted: myParticipation.isMuted,
    otherParticipants: otherParticipants.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: p.userName,
      userImage: p.userImage,
    })),
  });
};
