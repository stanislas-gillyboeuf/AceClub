import { Stack } from "expo-router";
import { Platform } from "react-native";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Profil", headerLargeTitle: true }} />
      <Stack.Screen
        name="settings"
        options={{
          title: "Paramètres",
          presentation: "fullScreenModal",
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="create-intent/index"
        options={{
          title: "Nouvelle dispo",
          presentation: formSheet,
          headerTransparent: true,
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.6, 0.85, 1],
            contentStyle: { flex: 1, backgroundColor: "transparent" },
          }),
        }}
      />
      <Stack.Screen
        name="club-selection"
        options={{
          title: "Sélectionner un club",
          presentation: formSheet,
          sheetGrabberVisible: Platform.OS === "ios",
        }}
      />
    </Stack>
  );
}
