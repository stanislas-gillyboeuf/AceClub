import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversationParticipant, message } from "../../../db/schema/conversation/schema";
import { user } from "../../../db/schema/auth/schema";
import { eq, and, desc, lt } from "drizzle-orm";

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

  // Check if user is a participant
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

  // Build query conditions
  const conditions = [eq(message.conversationId, conversationId), eq(message.isDeleted, false)];

  if (before) {
    conditions.push(lt(message.createdAt, before));
  }

  // Get messages with sender info
  const messages = await db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: user.name,
      senderImage: user.image,
      content: message.content,
      createdAt: message.createdAt,
      clientMessageId: message.clientMessageId,
    })
    .from(message)
    .innerJoin(user, eq(message.senderId, user.id))
    .where(and(...conditions))
    .orderBy(desc(message.createdAt))
    .limit(limit);

  return c.json(
    messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      sender: {
        id: msg.senderId,
        name: msg.senderName,
        image: msg.senderImage,
      },
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      clientMessageId: msg.clientMessageId,
      isFromMe: msg.senderId === currentUser.id,
    })),
  );
};
