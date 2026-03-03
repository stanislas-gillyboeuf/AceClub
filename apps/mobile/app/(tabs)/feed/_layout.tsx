import { Stack } from "expo-router";
import { Platform } from "react-native";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function FeedLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Activite", headerLargeTitle: true }} />
      <Stack.Screen
        name="ranking"
        options={{
          presentation: "fullScreenModal",
          title: "Classement",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="progression"
        options={{
          presentation: "fullScreenModal",
          title: "Progression",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: "Evenements",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="event-detail"
        options={{
          presentation: formSheet,
          title: "",
          headerTransparent: Platform.OS === "ios",
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.92, 1],
          }),
        }}
      />
    </Stack>
  );
}
