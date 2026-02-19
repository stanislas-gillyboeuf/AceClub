import { Stack } from "expo-router";
import { Platform } from "react-native";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function DiscoverLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Trouver un partenaire", headerLargeTitle: true, headerTransparent: Platform.OS === "ios" }}
      />
      <Stack.Screen
        name="create-intent"
        options={{
          title: "Nouvelle dispo",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerTransparent: true,
          sheetAllowedDetents: [0.6, 0.85, 1],
          contentStyle: { flex: 1, backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
