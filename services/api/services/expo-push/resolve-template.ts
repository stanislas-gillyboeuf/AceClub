import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  notificationTemplate,
  notificationTemplateVariant,
} from "../../db/schema/notification/schema";
import type { NotificationType } from "../../db/schema/notification/schema";

export class NotificationTemplateMissingError extends Error {
  constructor(public readonly type: NotificationType) {
    super(`No active template/variant for notification type "${type}"`);
    this.name = "NotificationTemplateMissingError";
  }
}

export function renderTemplate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => variables[key] ?? "");
}

export async function loadActiveVariants(
  type: NotificationType,
): Promise<{ title: string; body: string }[]> {
  return db
    .select({
      title: notificationTemplateVariant.title,
      body: notificationTemplateVariant.body,
    })
    .from(notificationTemplateVariant)
    .innerJoin(
      notificationTemplate,
      eq(notificationTemplateVariant.templateId, notificationTemplate.id),
    )
    .where(
      and(
        eq(notificationTemplate.type, type),
        eq(notificationTemplate.isActive, true),
        eq(notificationTemplateVariant.isActive, true),
      ),
    );
}

export function pickAndRender(
  variants: { title: string; body: string }[],
  variables: Record<string, string>,
  type: NotificationType,
): { title: string; body: string } {
  if (variants.length === 0) {
    throw new NotificationTemplateMissingError(type);
  }
  const picked = variants[Math.floor(Math.random() * variants.length)];
  return {
    title: renderTemplate(picked.title, variables),
    body: renderTemplate(picked.body, variables),
  };
}

export async function resolveNotificationContent(
  type: NotificationType,
  variables: Record<string, string>,
): Promise<{ title: string; body: string }> {
  const variants = await loadActiveVariants(type);
  return pickAndRender(variants, variables, type);
}
