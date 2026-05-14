import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../../../db/schema/notification/schema";
import { sendTestValidator } from "../validators";
import { renderTemplate } from "../../../../services/expo-push/resolve-template";
import { dispatchNotification } from "../../../../services/expo-push/notification-service";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const sendTest = async (c: Context<HonoContext>) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized", message: "Authentication required" }, 401);
  }

  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof sendTestValidator>;

  const [variant] = await db
    .select({
      title: notificationTemplateVariant.title,
      body: notificationTemplateVariant.body,
      type: notificationTemplate.type,
    })
    .from(notificationTemplateVariant)
    .innerJoin(
      notificationTemplate,
      eq(notificationTemplateVariant.templateId, notificationTemplate.id),
    )
    .where(eq(notificationTemplateVariant.id, validated.variantId))
    .limit(1);

  if (!variant) {
    return c.json({ error: "NotFound", message: "Variant not found" }, 404);
  }

  const title = renderTemplate(variant.title, validated.variables);
  const body = renderTemplate(variant.body, validated.variables);

  const result = await dispatchNotification({
    userId: user.id,
    type: variant.type,
    title,
    body,
    data: { isTest: "true" },
  });

  return c.json({
    success: true,
    title,
    body,
    devicesNotified: result.devicesNotified,
    devicesFound: result.devicesFound,
  });
};
