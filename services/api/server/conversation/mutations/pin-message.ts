import type { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant, message } from "../../../db/schema/conversation/schema";
import { pinMessageValidator } from "../validators";

/** messageId: null unpins. Group-only, admin-only. */
export const pinMessage = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const conversationId = c.req.param("id");
  // @ts-ignore
  const { messageId } = c.req.valid("json") as z.infer<typeof pinMessageValidator>;

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

  if (!myParticipation || !myParticipation.isAdmin) {
    return c.json({ error: "Forbidden", message: "Group admin required" }, 403);
  }

  if (messageId) {
    const [targetMessage] = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.id, messageId), eq(message.conversationId, conversationId), eq(message.isDeleted, false)),
      )
      .limit(1);
    if (!targetMessage) {
      return c.json({ error: "NotFound", message: "Message not found" }, 404);
    }
  }

  await db.update(conversation).set({ pinnedMessageId: messageId }).where(eq(conversation.id, conversationId));

  return c.json({ pinnedMessageId: messageId });
};
