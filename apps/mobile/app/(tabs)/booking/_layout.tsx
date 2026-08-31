import { Stack } from "expo-router";
import { Platform } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const formSheet = Platform.select({ ios: "formSheet" as const, default: "modal" as const });

export default function BookingLayout() {
  const scheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semanticColors.primaryBackground[scheme] },
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
