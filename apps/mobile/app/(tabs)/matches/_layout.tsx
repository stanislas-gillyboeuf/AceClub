import { Stack } from "expo-router";

export default function MatchesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Matches", headerLargeTitle: true }} />
      <Stack.Screen
        name="[id]/index"
        options={{
          presentation: "fullScreenModal",
          sheetGrabberVisible: false,
          title: "Détails du match",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="[id]/edit-scores"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          title: "Modifier les scores",
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
