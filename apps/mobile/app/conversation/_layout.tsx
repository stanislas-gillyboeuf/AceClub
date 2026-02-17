import { Stack } from "expo-router";

export default function ConversationLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: "", headerTransparent: true }} />
    </Stack>
  );
}
