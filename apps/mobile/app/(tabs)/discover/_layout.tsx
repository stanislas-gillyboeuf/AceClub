import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiscoverLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Stack>
      <Stack.Screen name="index" options={{ title: "Discover", headerLargeTitle: true }} />
      <Stack.Screen
        name="ranking"
        options={{
          presentation: "fullScreenModal",
          title: "Ranking",
          headerLargeTitle: true
        }}
      />
      </Stack>
    </SafeAreaView>
  );
}
