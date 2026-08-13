import { Stack } from "expo-router";
import { Platform } from "react-native";
import { courtColors } from "@/features/court-booking/theme";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: courtColors.ink900 },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="my-bookings" />
      <Stack.Screen name="book-for-club" />
      <Stack.Screen name="ticket/[bookingId]" />
      <Stack.Screen
        name="confirm"
        options={{
          headerShown: false,
          presentation: formSheet,
          ...(Platform.OS === "ios" && {
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.75, 1],
          }),
        }}
      />
    </Stack>
  );
}
