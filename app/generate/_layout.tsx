import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function GenerateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.primary,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="worksheet" />
      <Stack.Screen name="text" />
      <Stack.Screen name="image" />
    </Stack>
  );
}