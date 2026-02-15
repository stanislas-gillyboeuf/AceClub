import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Messages", headerLargeTitle: true }} />
      <Stack.Screen name="[conversationId]" options={{ headerBackTitle: "Messages" }} />
      <Stack.Screen
        name="new"
        options={{
          title: "Nouvelle conversation",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
