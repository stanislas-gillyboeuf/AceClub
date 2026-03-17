import { Platform } from "react-native";
import { Redirect, Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function OnboardingLayout() {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if ((session.user).onboardingCompleted) {
    return <Redirect href="/(tabs)/feed" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="club-selection"
        options={{
          headerShown: true,
          title: "Sélectionner un club",
          presentation: Platform.select({ ios: "formSheet", default: "modal" }),
          sheetGrabberVisible: Platform.OS === "ios",
        }}
      />
    </Stack>
  );
}
