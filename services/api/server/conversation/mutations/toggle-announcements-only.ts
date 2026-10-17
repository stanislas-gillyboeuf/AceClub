import type { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { toggleAnnouncementsOnlyValidator } from "../validators";

export const toggleAnnouncementsOnly = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const conversationId = c.req.param("id");
  // @ts-ignore
  const { announcementsOnly } = c.req.valid("json") as z.infer<typeof toggleAnnouncementsOnlyValidator>;

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

  const [updated] = await db
    .update(conversation)
    .set({ announcementsOnly })
    .where(eq(conversation.id, conversationId))
    .returning({ id: conversation.id, announcementsOnly: conversation.announcementsOnly });

  return c.json(updated);
};
