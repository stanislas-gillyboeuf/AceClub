import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";

// Configure foreground notification display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log("[Notifications] Must use physical device for push notifications");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? "55848fd1-bd32-4e6d-bd4b-d8d2066fcdc6";

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("[Notifications] Expo push token:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("[Notifications] Failed to get push token:", error);
    return null;
  }
}

function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as Record<string, string> | undefined;
  if (!data?.type) {
    router.navigate("/(tabs)/feed");
    return;
  }

  switch (data.type) {
    case "new_message":
      if (data.referenceId) {
        router.navigate(`/(tabs)/chat/${data.referenceId}` as any);
      } else {
        router.navigate("/(tabs)/chat");
      }
      break;

    case "new_match_request":
    case "match_reminder":
    case "invitation_accepted":
      router.navigate("/(tabs)/matches");
      break;

    case "match_request_accepted":
      if (data.referenceId) {
        router.navigate(`/(tabs)/matches/${data.referenceId}` as any);
      } else {
        router.navigate("/(tabs)/matches");
      }
      break;

    default:
      router.navigate("/(tabs)/feed");
      break;
  }
}

export function setupNotificationListeners(): () => void {
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log("[Notifications] Foreground notification:", notification.request.content.title);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("[Notifications] User tapped notification");
    handleNotificationResponse(response);
  });

  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
}
