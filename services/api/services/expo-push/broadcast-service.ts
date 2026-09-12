import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { db } from "../../db";
import { deviceToken, notification } from "../../db/schema";
import { and, eq, inArray } from "drizzle-orm";

const expo = new Expo();

export interface BroadcastParams {
  type: "club_announcement";
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface BroadcastResult {
  sent: number;
  failed: number;
}

/**
 * Batched push to many recipients at once — unlike sendNotificationToUser (strictly
 * 1:1), this bulk-inserts the notification history in one query and uses Expo's own
 * chunking rather than sending one-by-one in a loop (see cron/index.ts's
 * sendStreakWarnings for the pattern this deliberately avoids at broadcast scale).
 */
export async function sendBatchNotifications(
  userIds: string[],
  params: BroadcastParams,
): Promise<BroadcastResult> {
  if (userIds.length === 0) return { sent: 0, failed: 0 };

  const notificationRows = await db
    .insert(notification)
    .values(
      userIds.map((userId) => ({
        userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data ? JSON.stringify(params.data) : null,
        sentAt: new Date(),
      })),
    )
    .returning({ id: notification.id, userId: notification.userId });

  const notificationIdByUser = new Map(notificationRows.map((n) => [n.userId, n.id]));

  const tokens = await db
    .select()
    .from(deviceToken)
    .where(and(inArray(deviceToken.userId, userIds), eq(deviceToken.isActive, true)));

  const messages: ExpoPushMessage[] = tokens
    .filter((t) => Expo.isExpoPushToken(t.token))
    .map((t) => ({
      to: t.token,
      title: params.title,
      body: params.body,
      sound: "default",
      data: {
        notificationId: notificationIdByUser.get(t.userId) ?? "",
        type: params.type,
        ...params.data,
      },
    }));

  let sent = 0;
  let failed = 0;

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === "ok") sent++;
        else failed++;
      }
    } catch (error) {
      console.error("[Broadcast] Chunk send failed:", error);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}
