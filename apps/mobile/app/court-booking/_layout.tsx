import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useCourtFonts } from "@/features/court-booking/hooks/use-court-fonts";
import { courtColors } from "@/features/court-booking/theme";

export default function CourtBookingLayout() {
  const fontsLoaded = useCourtFonts();

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: courtColors.ink,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={courtColors.ball} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: courtColors.ink },
        headerTintColor: courtColors.chalk,
        headerTitleStyle: { color: courtColors.chalk },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: courtColors.ink },
      }}
    >
      <Stack.Screen name="[organizationId]" options={{ title: "Réserver un terrain" }} />
      <Stack.Screen name="my-bookings" options={{ title: "Mes réservations" }} />
      <Stack.Screen name="manage-courts" options={{ title: "Gérer mes terrains" }} />
      <Stack.Screen name="court-form" options={{ title: "Terrain", presentation: "modal" }} />
      <Stack.Screen name="booking-rules" options={{ title: "Règles de réservation" }} />
    </Stack>
  );
}
