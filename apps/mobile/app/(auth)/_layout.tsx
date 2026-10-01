import { Redirect, Stack, usePathname } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function AuthLayout() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();

  if (isPending) {
    return null;
  }

  // These screens all run right after sign-in/sign-up, while a session already exists but
  // before onboarding/feed (email verification, Apple's masked-email follow-up, matching a
  // CSV-imported profile, joining a club) — they need an exception from the redirect below,
  // otherwise it would bounce away before the player can even see them.
  const POST_SIGNUP_SCREENS = [
    "/apple-email",
    "/verify-email",
    "/reconcile-welcome",
    "/reconcile-choose",
    "/find-club",
    "/club-code",
  ];
  const isPostSignupScreen = POST_SIGNUP_SCREENS.includes(pathname);

  if (session?.user && !isPostSignupScreen) {
    if (!session.user.onboardingCompleted) {
      return <Redirect href="/(onboarding)" />;
    }
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
