import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Slot />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
