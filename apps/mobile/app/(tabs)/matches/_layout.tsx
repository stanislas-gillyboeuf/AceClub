import { Stack } from "expo-router";

export default function MatchesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Matches", headerLargeTitle: true }} />
      <Stack.Screen
        name="requests"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          title: "Demandes de match",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="create/index"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          title: "Nouveau match",
          headerTransparent: true,
          sheetAllowedDetents: [0.6, 0.85, 1],
          contentStyle: { flex: 1, backgroundColor: "transparent" },

        }}
      />
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
      <Stack.Screen
        name="[id]/comment"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          title: "Commentaire",
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
