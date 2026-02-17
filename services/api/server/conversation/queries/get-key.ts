import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  conversation,
  conversationParticipant,
} from "../../../db/schema/conversation/schema";
import { eq, and } from "drizzle-orm";

export const getConversationKey = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");

  // Verify user is a participant
  const [participation] = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, currentUser.id),
      ),
    )
    .limit(1);

  if (!participation) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }

  const [conv] = await db
    .select({ encryptionKey: conversation.encryptionKey })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv || !conv.encryptionKey) {
    return c.json({ error: "NotFound", message: "No encryption key for this conversation" }, 404);
  }

  return c.json({ key: conv.encryptionKey });
};
