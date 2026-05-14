import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import { notificationTemplateVariant } from "../../../../db/schema/notification/schema";
import { updateVariantValidator } from "../validators";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const updateVariant = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateVariantValidator>;

  const [updated] = await db
    .update(notificationTemplateVariant)
    .set(validated)
    .where(eq(notificationTemplateVariant.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "NotFound", message: "Variant not found" }, 404);
  }
  return c.json(updated);
};
