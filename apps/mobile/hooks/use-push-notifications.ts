import { useEffect } from "react";
import { Platform } from "react-native";
import {
  requestPermissions,
  getExpoPushToken,
  setupNotificationListeners,
} from "@/lib/notifications";
import { notificationService } from "@/services/notification";

export function usePushNotifications(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let cleanup: (() => void) | undefined;

    async function init() {
      const granted = await requestPermissions();
      if (!granted) return;

      const token = await getExpoPushToken();
      if (!token) return;

      try {
        await notificationService.registerDeviceToken({
          token,
          platform: Platform.OS,
        });
      } catch (error) {
        console.error("[PushNotifications] Failed to register token:", error);
      }

      cleanup = setupNotificationListeners();
    }

    init();

    return () => {
      cleanup?.();
    };
  }, [enabled]);
}
