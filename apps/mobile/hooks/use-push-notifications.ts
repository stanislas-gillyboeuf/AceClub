import { useEffect } from "react";
import { Platform } from "react-native";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "@/lib/notifications";
import { notificationService } from "@/services/notification";

export function usePushNotifications(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let cleanup: (() => void) | undefined;

    registerForPushNotificationsAsync()
      .then(async (token) => {
        if (!token) return;
        try {
          await notificationService.registerDeviceToken({
            token,
            platform: Platform.OS,
          });
        } catch (error) {
          console.error(
            "[PushNotifications] Failed to register token:",
            error
          );
        }
      })
      .catch((error: any) =>
        console.error("[PushNotifications] Registration error:", error)
      );

    cleanup = setupNotificationListeners();

    return () => {
      cleanup?.();
    };
  }, [enabled]);
}
