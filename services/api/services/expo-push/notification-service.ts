import { db } from "../../db";
import { deviceToken, notification } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { sendPushNotification, isInvalidTokenError, type PushNotificationPayload } from "./index";
import { resolveNotificationContent } from "./resolve-template";
import type { NotificationType } from "../../db/schema/notification/schema";

export type { NotificationType };

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  variables?: Record<string, string>;
  referenceId?: string;
  referenceType?: string;
  data?: Record<string, string>;
}

interface DispatchParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId?: string;
  referenceType?: string;
  data?: Record<string, string>;
}

export interface DispatchResult {
  notificationId: string;
  devicesFound: number;
  devicesNotified: number;
}

export async function dispatchNotification(params: DispatchParams): Promise<DispatchResult> {
  const { userId, type, title, body, referenceId, referenceType, data } = params;

  const [newNotification] = await db
    .insert(notification)
    .values({
      userId,
      type,
      title,
      body,
      data: data ? JSON.stringify(data) : null,
      referenceId,
      referenceType,
      sentAt: new Date(),
    })
    .returning({ id: notification.id });

  const tokens = await db
    .select()
    .from(deviceToken)
    .where(and(eq(deviceToken.userId, userId), eq(deviceToken.isActive, true)));

  let devicesNotified = 0;
  for (const token of tokens) {
    const payload: PushNotificationPayload = {
      deviceToken: token.token,
      title,
      body,
      data: {
        notificationId: newNotification.id,
        type,
        ...(referenceId && { referenceId }),
        ...(referenceType && { referenceType }),
        ...data,
      },
    };

    const result = await sendPushNotification(payload);

    if (!result.success && isInvalidTokenError(result.reason)) {
      await db
        .update(deviceToken)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(deviceToken.id, token.id));
    } else if (result.success) {
      devicesNotified++;
      await db
        .update(deviceToken)
        .set({ lastUsedAt: new Date() })
        .where(eq(deviceToken.id, token.id));
    }
  }

  console.log(
    `[Notification] type=${type} user=${userId} sent=${devicesNotified}/${tokens.length}`,
  );

  return { notificationId: newNotification.id, devicesFound: tokens.length, devicesNotified };
}

export async function sendNotificationToUser(
  params: SendNotificationParams,
): Promise<DispatchResult> {
  const { title, body } = await resolveNotificationContent(params.type, params.variables ?? {});
  return dispatchNotification({
    userId: params.userId,
    type: params.type,
    title,
    body,
    referenceId: params.referenceId,
    referenceType: params.referenceType,
    data: params.data,
  });
}
