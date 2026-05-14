import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import { notificationTemplateVariant } from "../../../../db/schema/notification/schema";
import { eq } from "drizzle-orm";

export const deleteVariant = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(notificationTemplateVariant)
    .where(eq(notificationTemplateVariant.id, id))
    .returning({ id: notificationTemplateVariant.id });

  if (!deleted) {
    return c.json({ error: "NotFound", message: "Variant not found" }, 404);
  }
  return c.json({ success: true });
};
