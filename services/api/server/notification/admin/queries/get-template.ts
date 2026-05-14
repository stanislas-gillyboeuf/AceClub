import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../../../db/schema/notification/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { templateTypeParamValidator } from "../validators";

export const getTemplate = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const { type } = c.req.valid("param") as z.infer<typeof templateTypeParamValidator>;

  const [template] = await db
    .select()
    .from(notificationTemplate)
    .where(eq(notificationTemplate.type, type))
    .limit(1);

  if (!template) {
    return c.json({ error: "NotFound", message: "Template not found" }, 404);
  }

  const variants = await db
    .select()
    .from(notificationTemplateVariant)
    .where(eq(notificationTemplateVariant.templateId, template.id))
    .orderBy(asc(notificationTemplateVariant.createdAt));

  return c.json({ template, variants });
};
