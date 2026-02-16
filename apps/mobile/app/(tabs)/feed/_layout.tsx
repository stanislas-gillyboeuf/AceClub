import { Stack } from "expo-router";

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
    </Stack>
  );
}
