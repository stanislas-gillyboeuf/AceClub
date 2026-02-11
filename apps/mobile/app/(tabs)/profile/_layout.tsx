import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="progression" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="leaderboard" />
    </Stack>
  );
}
