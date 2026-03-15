import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();

export interface PushNotificationPayload {
  deviceToken: string;
  title: string;
  body: string;
  badge?: number;
  sound?: string;
  data?: Record<string, string>;
}

export interface PushResponse {
  success: boolean;
  reason?: string;
  deviceToken: string;
}

export async function sendPushNotification(
  payload: PushNotificationPayload,
): Promise<PushResponse> {
  const { deviceToken, title, body, badge, sound, data } = payload;

  if (!Expo.isExpoPushToken(deviceToken)) {
    console.error(`[ExpoPush] Invalid Expo push token: ${deviceToken}`);
    return { success: false, reason: "InvalidToken", deviceToken };
  }

  console.log(`[ExpoPush] Sending notification to: ${deviceToken.substring(0, 30)}...`);

  const message: ExpoPushMessage = {
    to: deviceToken,
    title,
    body,
    badge,
    sound: sound ?? "default",
    data,
  };

  try {
    const [ticket] = await expo.sendPushNotificationsAsync([message]);

    if (ticket.status === "ok") {
      console.log(`[ExpoPush] Success`);
      return { success: true, deviceToken };
    }

    const errorTicket = ticket as ExpoPushTicket & {
      message?: string;
      details?: { error?: string };
    };
    const reason = errorTicket.details?.error ?? errorTicket.message ?? "Unknown error";
    console.error(`[ExpoPush] Failed: ${reason}`);
    return { success: false, reason, deviceToken };
  } catch (error) {
    console.error("[ExpoPush] Exception:", error);
    return {
      success: false,
      reason: error instanceof Error ? error.message : "Unknown error",
      deviceToken,
    };
  }
}

export function isInvalidTokenError(reason?: string): boolean {
  return reason === "DeviceNotRegistered" || reason === "InvalidToken";
}
