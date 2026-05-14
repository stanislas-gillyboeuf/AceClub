import { schedules } from "@trigger.dev/sdk";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { db } from "../db";
import {
  deviceToken,
  notification,
  notificationSchedule,
  notificationTemplate,
  notificationTemplateVariant,
} from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { isInvalidTokenError } from "../services/expo-push";
import {
  pickAndRender,
  NotificationTemplateMissingError,
} from "../services/expo-push/resolve-template";
import { resolveAudience } from "../services/notification-audience";

export const SEND_SCHEDULED_NOTIFICATION_TASK_ID = "send-scheduled-notification";

const expo = new Expo();

/**
 * Dynamic scheduled task — triggered by schedules created from the admin web dashboard.
 * payload.externalId carries the notificationSchedule row id.
 */
export const sendScheduledNotificationTask = schedules.task({
  id: SEND_SCHEDULED_NOTIFICATION_TASK_ID,
  run: async (payload) => {
    const scheduleId = payload.externalId;
    if (!scheduleId) {
      console.warn("[TRIGGER] send-scheduled-notification called without externalId");
      return { skipped: true, reason: "missing-externalId" as const };
    }

    const [scheduleRow] = await db
      .select({
        id: notificationSchedule.id,
        isActive: notificationSchedule.isActive,
        templateId: notificationSchedule.templateId,
        audience: notificationSchedule.audience,
        defaultVariables: notificationSchedule.defaultVariables,
        type: notificationTemplate.type,
      })
      .from(notificationSchedule)
      .innerJoin(notificationTemplate, eq(notificationSchedule.templateId, notificationTemplate.id))
      .where(eq(notificationSchedule.id, scheduleId))
      .limit(1);

    if (!scheduleRow || !scheduleRow.isActive) {
      console.log(`[TRIGGER] schedule ${scheduleId} not found or inactive, skipping`);
      return { skipped: true, reason: "not-active" as const };
    }

    const variants = await db
      .select({
        title: notificationTemplateVariant.title,
        body: notificationTemplateVariant.body,
      })
      .from(notificationTemplateVariant)
      .where(
        and(
          eq(notificationTemplateVariant.templateId, scheduleRow.templateId),
          eq(notificationTemplateVariant.isActive, true),
        ),
      );

    if (variants.length === 0) {
      throw new NotificationTemplateMissingError(scheduleRow.type);
    }

    const userIds = await resolveAudience(scheduleRow.audience);
    console.log(
      `[TRIGGER] schedule ${scheduleId} (type=${scheduleRow.type}) → ${userIds.length} recipients`,
    );

    if (userIds.length === 0) {
      await db
        .update(notificationSchedule)
        .set({ lastRunAt: new Date() })
        .where(eq(notificationSchedule.id, scheduleId));
      return { sent: 0, total: 0 };
    }

    // Build a per-user rendered (title, body) — each user gets their own random variant.
    const rendered = userIds.map((userId) => ({
      userId,
      ...pickAndRender(variants, scheduleRow.defaultVariables, scheduleRow.type),
    }));

    // Bulk insert notification history rows in one round-trip.
    const sentAt = new Date();
    const notificationRows = rendered.map(({ userId, title, body }) => ({
      id: ulid(),
      userId,
      type: scheduleRow.type,
      title,
      body,
      sentAt,
    }));
    await db.insert(notification).values(notificationRows);

    // Fetch all active device tokens for the audience in one query.
    const tokens = await db
      .select({
        id: deviceToken.id,
        userId: deviceToken.userId,
        token: deviceToken.token,
      })
      .from(deviceToken)
      .where(and(inArray(deviceToken.userId, userIds), eq(deviceToken.isActive, true)));

    const tokensByUser = new Map<string, typeof tokens>();
    for (const t of tokens) {
      const list = tokensByUser.get(t.userId) ?? [];
      list.push(t);
      tokensByUser.set(t.userId, list);
    }

    // Build the flat list of push messages, keeping a parallel array of token IDs
    // so we can mark invalid tokens after the Expo response.
    const messages: ExpoPushMessage[] = [];
    const messageTokenIds: string[] = [];
    for (const { userId, title, body } of rendered) {
      const notificationId = notificationRows.find((n) => n.userId === userId)!.id;
      const userTokens = tokensByUser.get(userId) ?? [];
      for (const t of userTokens) {
        if (!Expo.isExpoPushToken(t.token)) {
          messages.push({ to: t.token, title, body });
          messageTokenIds.push(t.id);
          continue;
        }
        messages.push({
          to: t.token,
          title,
          body,
          sound: "default",
          data: { notificationId, type: scheduleRow.type },
        });
        messageTokenIds.push(t.id);
      }
    }

    if (messages.length === 0) {
      await db
        .update(notificationSchedule)
        .set({ lastRunAt: sentAt })
        .where(eq(notificationSchedule.id, scheduleId));
      return { sent: 0, total: userIds.length, devicesReached: 0 };
    }

    // Expo accepts up to 100 messages per request; chunk and send in parallel.
    const chunks = expo.chunkPushNotifications(messages);
    let cursor = 0;
    const invalidTokenIds: string[] = [];
    const usedTokenIds: string[] = [];

    const chunkResults = await Promise.allSettled(
      chunks.map(async (chunk) => {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        return tickets;
      }),
    );

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const result = chunkResults[i];
      if (result.status === "rejected") {
        console.error(`[TRIGGER] Expo chunk ${i} failed:`, result.reason);
        cursor += chunk.length;
        continue;
      }
      for (let j = 0; j < chunk.length; j++) {
        const ticket = result.value[j];
        const tokenId = messageTokenIds[cursor + j];
        if (ticket.status === "ok") {
          usedTokenIds.push(tokenId);
        } else {
          const reason = ticket.details?.error;
          if (isInvalidTokenError(reason)) {
            invalidTokenIds.push(tokenId);
          }
        }
      }
      cursor += chunk.length;
    }

    if (usedTokenIds.length > 0) {
      await db
        .update(deviceToken)
        .set({ lastUsedAt: sentAt })
        .where(inArray(deviceToken.id, usedTokenIds));
    }
    if (invalidTokenIds.length > 0) {
      await db
        .update(deviceToken)
        .set({ isActive: false, updatedAt: sentAt })
        .where(inArray(deviceToken.id, invalidTokenIds));
    }

    await db
      .update(notificationSchedule)
      .set({ lastRunAt: sentAt })
      .where(eq(notificationSchedule.id, scheduleId));

    return {
      sent: usedTokenIds.length,
      total: userIds.length,
      devicesReached: usedTokenIds.length,
      invalidTokens: invalidTokenIds.length,
    };
  },
});
