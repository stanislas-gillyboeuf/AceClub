import { schedules } from "@trigger.dev/sdk";
import { db } from "../db";
import { notificationSchedule } from "../db/schema/notification/schema";
import { eq } from "drizzle-orm";
import { sendNotificationToUser } from "../services/expo-push/notification-service";
import { resolveAudience } from "../services/notification-audience";

/**
 * Dynamic scheduled task — triggered by schedules created from the admin web dashboard.
 * payload.externalId carries the notificationSchedule row id.
 */
export const sendScheduledNotificationTask = schedules.task({
  id: "send-scheduled-notification",
  run: async (payload) => {
    const scheduleId = payload.externalId;
    if (!scheduleId) {
      console.warn("[TRIGGER] send-scheduled-notification called without externalId");
      return { skipped: true, reason: "missing-externalId" as const };
    }

    const [row] = await db
      .select()
      .from(notificationSchedule)
      .where(eq(notificationSchedule.id, scheduleId))
      .limit(1);

    if (!row || !row.isActive) {
      console.log(`[TRIGGER] schedule ${scheduleId} not found or inactive, skipping`);
      return { skipped: true, reason: "not-active" as const };
    }

    const templateRow = await db.query.notificationTemplate.findFirst({
      where: (t, { eq }) => eq(t.id, row.templateId),
    });
    if (!templateRow) {
      throw new Error(`Template ${row.templateId} not found for schedule ${scheduleId}`);
    }

    const userIds = await resolveAudience(row.audience);
    console.log(
      `[TRIGGER] schedule ${scheduleId} (${row.name}) → ${userIds.length} recipients (type=${templateRow.type})`,
    );

    let sent = 0;
    let failed = 0;
    for (const userId of userIds) {
      try {
        await sendNotificationToUser({
          userId,
          type: templateRow.type,
          variables: row.defaultVariables,
        });
        sent++;
      } catch (err) {
        failed++;
        console.error(`[TRIGGER] schedule ${scheduleId} failed for user ${userId}:`, err);
      }
    }

    await db
      .update(notificationSchedule)
      .set({ lastRunAt: new Date() })
      .where(eq(notificationSchedule.id, scheduleId));

    return { sent, failed, total: userIds.length };
  },
});
