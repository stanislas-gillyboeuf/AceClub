import { Stack } from "expo-router";
import { courtColors } from "@/features/court-booking/theme";

export default function CourtBookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: courtColors.ink900 },
        headerTintColor: courtColors.chalk,
        headerTitleStyle: { color: courtColors.chalk },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: courtColors.ink900 },
      }}
    >
      <Stack.Screen name="manage-courts" options={{ title: "Gérer mes terrains" }} />
      <Stack.Screen name="court-form" options={{ title: "Terrain", presentation: "modal" }} />
      <Stack.Screen name="booking-rules" options={{ title: "Règles de réservation" }} />
    </Stack>
  );
}
