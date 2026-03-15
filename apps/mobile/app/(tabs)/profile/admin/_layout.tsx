import { Stack } from "expo-router";
import { Platform } from "react-native";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Administration",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="create-event"
        options={{
          title: "Nouvel event",
          presentation: formSheet,
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.92, 1],
          }),
        }}
      />
      <Stack.Screen
        name="edit-event"
        options={{
          title: "Modifier l'event",
          presentation: formSheet,
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.92, 1],
          }),
        }}
      />
      <Stack.Screen
        name="org-settings"
        options={{
          title: "Paramètres du club",
          presentation: formSheet,
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.85, 1],
          }),
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          title: "Membres",
        }}
      />
      <Stack.Screen
        name="club-selection"
        options={{
          title: "Selectionner un club",
          presentation: formSheet,
          sheetGrabberVisible: Platform.OS === "ios",
        }}
      />
    </Stack>
  );
}
