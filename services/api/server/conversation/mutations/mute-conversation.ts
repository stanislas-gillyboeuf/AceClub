import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversationParticipant } from "../../../db/schema/conversation/schema";
import { eq, and } from "drizzle-orm";

export const muteConversation = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");
  const body = await c.req.json();
  const { isMuted } = body;

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

  // Update mute status
  await db
    .update(conversationParticipant)
    .set({ isMuted })
    .where(eq(conversationParticipant.id, myParticipation.id));

  return c.json({ success: true, isMuted });
};
