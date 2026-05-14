import { Context } from "hono";
import type { HonoContext } from "../../../../types/hono";
import { db } from "../../../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../../../db/schema/notification/schema";
import { eq, asc } from "drizzle-orm";
import type { NotificationType } from "../../../../services/expo-push/notification-service";

const VALID_TYPES: NotificationType[] = [
  "match_request_accepted",
  "invitation_accepted",
  "new_match_request",
  "match_reminder",
  "challenge_assigned",
  "streak_warning",
  "new_message",
  "match_liked",
];

export const getTemplate = async (c: Context<HonoContext>) => {
  const rawType = c.req.param("type");
  if (!VALID_TYPES.includes(rawType as NotificationType)) {
    return c.json({ error: "BadRequest", message: "Invalid notification type" }, 400);
  }
  const type = rawType as NotificationType;

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
