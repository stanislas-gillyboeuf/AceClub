import { Stack } from "expo-router";

export default function MatchDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-scores" />
    </Stack>
  );
}
