import { Stack } from "expo-router";
import { Platform } from "react-native";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function MatchesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Matches", headerLargeTitle: true }} />
      <Stack.Screen
        name="requests"
        options={{
          presentation: formSheet,
          sheetGrabberVisible: Platform.OS === "ios",
          title: "Demandes de match",
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="create/index"
        options={{
          presentation: formSheet,
          title: "Nouveau match",
          headerTransparent: Platform.OS === "ios",
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.6, 0.85, 1],
          }),
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          presentation: "fullScreenModal",
          title: "Détails du match",
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="[id]/edit-scores"
        options={{
          presentation: formSheet,
          sheetGrabberVisible: Platform.OS === "ios",
          title: "Modifier les scores",
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="[id]/venue-detail"
        options={{
          presentation: formSheet,
          title: "Lieu",
          headerTransparent: Platform.OS === "ios",
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.45, 0.7],
          }),
        }}
      />
      <Stack.Screen
        name="[id]/feedback"
        options={{
          presentation: formSheet,
          sheetGrabberVisible: Platform.OS === "ios",
          title: "Sensations",
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="[id]/comment"
        options={{
          presentation: formSheet,
          sheetGrabberVisible: Platform.OS === "ios",
          title: "Commentaire",
          headerTransparent: Platform.OS === "ios",
        }}
      />
    </Stack>
  );
}
