import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Profil", headerLargeTitle: true }} />
      <Stack.Screen
        name="settings"
        options={{
          title: "Paramètres",
          presentation: "fullScreenModal",
          sheetGrabberVisible: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="create-intent/index"
        options={{
          title: "Nouvelle dispo",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
          sheetAllowedDetents: [0.6, 0.85, 1],
          contentStyle: { flex: 1, backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="club-selection"
        options={{
          title: "Sélectionner un club",
          presentation: "formSheet",
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
