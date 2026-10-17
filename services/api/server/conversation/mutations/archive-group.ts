import type { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversation } from "../../../db/schema/conversation/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { archiveGroupValidator } from "../validators";

export const archiveGroup = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  const conversationId = c.req.param("id");
  // @ts-ignore
  const { isArchived } = c.req.valid("json") as z.infer<typeof archiveGroupValidator>;

  const [conv] = await db
    .select({ organizationId: conversation.organizationId, type: conversation.type })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!conv || conv.type !== "group" || !conv.organizationId) {
    return c.json({ error: "NotFound", message: "Group not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, conv.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [updated] = await db
    .update(conversation)
    .set({ isArchived })
    .where(eq(conversation.id, conversationId))
    .returning({ id: conversation.id, isArchived: conversation.isArchived });

  return c.json(updated);
};
