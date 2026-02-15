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
    </Stack>
  );
}
