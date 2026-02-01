import { db } from "../../db";
import { deviceToken, notification } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import {
  sendPushNotification,
  isInvalidTokenError,
  type PushNotificationPayload,
} from "./index";

export type NotificationType =
  | "match_request_accepted"
  | "invitation_accepted"
  | "match_reminder"
  | "new_match_request"
  | "streak_warning"
  | "challenge_assigned"
  | "new_message";


interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId?: string;
  referenceType?: string;
  data?: Record<string, string>;
}

export async function sendNotificationToUser(
  params: SendNotificationParams,
): Promise<void> {
  const { userId, type, title, body, referenceId, referenceType, data } =
    params;

  console.log(`[Notification] Sending notification to user ${userId}`);
  console.log(`[Notification] Type: ${type}, Title: ${title}`);

  // 1. Enregistrer la notification dans l'historique
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
    .returning();

  // 2. Recuperer tous les device tokens actifs de l'utilisateur
  const tokens = await db
    .select()
    .from(deviceToken)
    .where(and(eq(deviceToken.userId, userId), eq(deviceToken.isActive, true)));

  console.log(`[Notification] Found ${tokens.length} device token(s) for user ${userId}`);

  if (tokens.length === 0) {
    console.log(`[Notification] No active device tokens for user ${userId} - skipping push`);
    return;
  }

  // 3. Envoyer la push notification a chaque device
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
      // Marquer le token comme inactif si l'envoi a echoue (token invalide)
      console.log(`Deactivating invalid token for user ${userId}`);
      await db
        .update(deviceToken)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(deviceToken.id, token.id));
    } else if (result.success) {
      // Mettre a jour lastUsedAt
      await db
        .update(deviceToken)
        .set({ lastUsedAt: new Date() })
        .where(eq(deviceToken.id, token.id));
    }
  }
}
