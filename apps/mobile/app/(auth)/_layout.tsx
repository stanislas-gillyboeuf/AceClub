import { Redirect, Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function AuthLayout() {
  const { data: session } = authClient.useSession();

  if (session?.user) {
    if (!(session.user as any).onboardingCompleted) {
      return <Redirect href="/(onboarding)" />;
    }
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
