import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../db/schema/notification/schema";
import type { NotificationType } from "./notification-service";

export class NotificationTemplateMissingError extends Error {
  constructor(public readonly type: NotificationType) {
    super(`No active template/variant for notification type "${type}"`);
    this.name = "NotificationTemplateMissingError";
  }
}

export function renderTemplate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => variables[key] ?? "");
}

export async function resolveNotificationContent(
  type: NotificationType,
  variables: Record<string, string>,
): Promise<{ title: string; body: string }> {
  const [template] = await db
    .select({ id: notificationTemplate.id })
    .from(notificationTemplate)
    .where(and(eq(notificationTemplate.type, type), eq(notificationTemplate.isActive, true)))
    .limit(1);

  if (!template) {
    throw new NotificationTemplateMissingError(type);
  }

  const variants = await db
    .select({
      title: notificationTemplateVariant.title,
      body: notificationTemplateVariant.body,
    })
    .from(notificationTemplateVariant)
    .where(
      and(
        eq(notificationTemplateVariant.templateId, template.id),
        eq(notificationTemplateVariant.isActive, true),
      ),
    );

  if (variants.length === 0) {
    throw new NotificationTemplateMissingError(type);
  }

  const picked = variants[Math.floor(Math.random() * variants.length)];

  return {
    title: renderTemplate(picked.title, variables),
    body: renderTemplate(picked.body, variables),
  };
}
