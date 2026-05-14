import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../../../db/schema/notification/schema";
import { createVariantValidator } from "../validators";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const createVariant = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createVariantValidator>;

  const [template] = await db
    .select({ id: notificationTemplate.id })
    .from(notificationTemplate)
    .where(eq(notificationTemplate.id, validated.templateId))
    .limit(1);

  if (!template) {
    return c.json({ error: "NotFound", message: "Template not found" }, 404);
  }

  const [created] = await db
    .insert(notificationTemplateVariant)
    .values({
      templateId: validated.templateId,
      title: validated.title,
      body: validated.body,
      isActive: validated.isActive,
    })
    .returning();

  return c.json(created, 201);
};
