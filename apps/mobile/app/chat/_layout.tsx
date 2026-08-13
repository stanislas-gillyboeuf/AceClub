import { Stack } from "expo-router";
import { Platform } from "react-native";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Messages", headerLargeTitle: true }} />
      <Stack.Screen
        name="new"
        options={{
          presentation: formSheet,
          title: "Nouveau message",
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
