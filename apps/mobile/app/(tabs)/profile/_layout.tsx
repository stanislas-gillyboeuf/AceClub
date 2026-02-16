import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Profil", headerLargeTitle: true }} />
      <Stack.Screen
        name="settings"
        options={{
          title: "Paramètres",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="create-intent"
        options={{
          title: "Nouvelle dispo",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="e2ee-backup"
        options={{
          title: "Sauvegarder ma cle",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="e2ee-recovery"
        options={{
          title: "Recuperer ma cle",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="club-selection"
        options={{
          title: "Selectionner un club",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
