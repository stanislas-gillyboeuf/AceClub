import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuthStore } from "@/stores/auth";
import { wsManager } from "@/lib/websocket";
import { useRouter, useSegments } from "expo-router";
import {
  useNotificationRegistration,
  useNotificationHandler,
} from "@/hooks/useNotifications";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useNotificationRegistration();
  useNotificationHandler();

  useEffect(() => {
    if (isAuthenticated) {
      wsManager.connect();
    } else {
      wsManager.disconnect();
    }
    return () => wsManager.disconnect();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      if (user && !user.onboardingCompleted) {
        router.replace("/(onboarding)/welcome");
      } else {
        router.replace("/(tabs)/feed");
      }
    } else if (
      isAuthenticated &&
      user &&
      !user.onboardingCompleted &&
      !inOnboardingGroup
    ) {
      router.replace("/(onboarding)/welcome");
    }
  }, [isAuthenticated, isLoading, user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "JetBrainsMono-Regular": require("../assets/fonts/JetBrainsMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <AuthGuard>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </AuthGuard>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
