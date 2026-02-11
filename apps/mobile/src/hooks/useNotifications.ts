import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  addNotificationResponseListener,
  getNotificationData,
} from "@/lib/notifications";
import { useAuthStore } from "@/stores/auth";

function navigateFromNotification(
  data: ReturnType<typeof getNotificationData>,
  router: ReturnType<typeof useRouter>
) {
  const type = data.type;
  const referenceId = data.referenceId;

  if (!type || !referenceId) return;

  switch (type) {
    case "new_message":
      router.push(`/(tabs)/chat/${referenceId}` as any);
      break;
    case "match_request_accepted":
    case "new_match_request":
    case "match_reminder":
      router.push(`/(tabs)/matches/${referenceId}` as any);
      break;
  }
}

export function useNotificationRegistration() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    registerForPushNotifications().catch(() => {});
  }, [isAuthenticated]);
}

export function useNotificationHandler() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>(null);

  useEffect(() => {
    // Handle notification tap when app is in background/killed
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = getNotificationData(response);
        navigateFromNotification(data, router);
      }
    });

    // Handle notification tap when app is running
    responseListener.current = addNotificationResponseListener((response) => {
      const data = getNotificationData(response);
      navigateFromNotification(data, router);
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}
