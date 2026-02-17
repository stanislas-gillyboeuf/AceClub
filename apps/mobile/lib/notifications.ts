import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.warn("[PushNotifications] Must use physical device for push notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    handleRegistrationError("Permission not granted to get push token!");
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    handleRegistrationError("Project ID not found");
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
    console.log(pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
  }
}

function handleNotificationResponse(
  response: Notifications.NotificationResponse
) {
  const data = response.notification.request.content.data as
    | Record<string, string>
    | undefined;
  if (!data?.type) {
    router.navigate("/(tabs)/feed");
    return;
  }

  switch (data.type) {
    case "new_message":
      if (data.referenceId) {
        router.navigate(`/conversation/${data.referenceId}` as any);
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
  const foregroundSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log(
        "[Notifications] Foreground notification:",
        notification.request.content.title
      );
    }
  );

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("[Notifications] User tapped notification");
      handleNotificationResponse(response);
    }
  );

  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
}
