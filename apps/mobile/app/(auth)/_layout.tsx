import { Redirect, Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function AuthLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  if (session?.user) {
    if (!session.user.onboardingCompleted) {
      return <Redirect href="/(onboarding)" />;
    }
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
