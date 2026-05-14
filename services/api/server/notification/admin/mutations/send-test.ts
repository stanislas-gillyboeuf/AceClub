import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
  deviceToken,
  notification,
} from "../../../../db/schema/notification/schema";
import { sendTestValidator } from "../validators";
import { renderTemplate } from "../../../../services/expo-push/resolve-template";
import {
  sendPushNotification,
  isInvalidTokenError,
  type PushNotificationPayload,
} from "../../../../services/expo-push";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const sendTest = async (c: Context<HonoContext>) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized", message: "Authentication required" }, 401);
  }

  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof sendTestValidator>;

  const [variant] = await db
    .select({
      id: notificationTemplateVariant.id,
      title: notificationTemplateVariant.title,
      body: notificationTemplateVariant.body,
      templateId: notificationTemplateVariant.templateId,
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

  const [newNotification] = await db
    .insert(notification)
    .values({
      userId: user.id,
      type: variant.type,
      title,
      body,
      sentAt: new Date(),
    })
    .returning();

  const tokens = await db
    .select()
    .from(deviceToken)
    .where(and(eq(deviceToken.userId, user.id), eq(deviceToken.isActive, true)));

  let pushedCount = 0;
  for (const token of tokens) {
    const payload: PushNotificationPayload = {
      deviceToken: token.token,
      title,
      body,
      data: {
        notificationId: newNotification.id,
        type: variant.type,
        isTest: "true",
      },
    };
    const result = await sendPushNotification(payload);
    if (result.success) {
      pushedCount++;
      await db
        .update(deviceToken)
        .set({ lastUsedAt: new Date() })
        .where(eq(deviceToken.id, token.id));
    } else if (isInvalidTokenError(result.reason)) {
      await db
        .update(deviceToken)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(deviceToken.id, token.id));
    }
  }

  return c.json({
    success: true,
    title,
    body,
    devicesNotified: pushedCount,
    devicesFound: tokens.length,
  });
};
