import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Messages", headerLargeTitle: true }} />
      <Stack.Screen
        name="new"
        options={{
          presentation: "formSheet",
          title: "Nouveau message",
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
