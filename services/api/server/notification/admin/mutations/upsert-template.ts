import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import { notificationTemplate } from "../../../../db/schema/notification/schema";
import { upsertTemplateValidator } from "../validators";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const upsertTemplate = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof upsertTemplateValidator>;

  const [existing] = await db
    .select({ id: notificationTemplate.id })
    .from(notificationTemplate)
    .where(eq(notificationTemplate.type, validated.type))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(notificationTemplate)
      .set({
        description: validated.description,
        availableVariables: validated.availableVariables,
        isActive: validated.isActive,
      })
      .where(eq(notificationTemplate.id, existing.id))
      .returning();
    return c.json(updated);
  }

  const [created] = await db.insert(notificationTemplate).values(validated).returning();
  return c.json(created, 201);
};
