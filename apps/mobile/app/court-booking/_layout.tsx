import { Stack } from "expo-router";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function CourtBookingLayout() {
  const scheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: semanticColors.cardBackground[scheme] },
        headerTintColor: semanticColors.labelPrimary[scheme],
        headerTitleStyle: { color: semanticColors.labelPrimary[scheme] },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: semanticColors.primaryBackground[scheme] },
      }}
    >
      <Stack.Screen name="manage-courts" options={{ title: "Gérer mes terrains" }} />
      <Stack.Screen name="court-form" options={{ title: "Terrain", presentation: "modal" }} />
      <Stack.Screen name="booking-rules" options={{ title: "Règles de réservation" }} />
    </Stack>
  );
}
