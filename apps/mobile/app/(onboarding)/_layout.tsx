import { Redirect, Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function OnboardingLayout() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if ((session.user).onboardingCompleted) {
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
