import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="club" />
      <Stack.Screen name="sport" />
      <Stack.Screen name="level" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="phone" />
    </Stack>
  );
}
