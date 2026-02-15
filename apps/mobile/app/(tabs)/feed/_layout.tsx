import { Stack } from "expo-router";

export default function FeedLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Activite", headerLargeTitle: true }} />
      <Stack.Screen
        name="ranking"
        options={{
          presentation: "fullScreenModal",
          title: "Ranking",
          headerLargeTitle: true
        }}
      />
      </Stack>
  );
}
