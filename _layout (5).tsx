import { Stack } from "expo-router";

export default function CourtBookingLayout() {
  return (
    <Stack>
      <Stack.Screen name="[organizationId]" options={{ title: "Réserver un court" }} />
    </Stack>
  );
}
