import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="level" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="diet" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}