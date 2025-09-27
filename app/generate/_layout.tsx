import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function GenerateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="worksheet" 
        options={{ title: 'Generate Worksheet' }}
      />
      <Stack.Screen 
        name="text" 
        options={{ title: 'Text Worksheet' }}
      />
      <Stack.Screen 
        name="image" 
        options={{ title: 'Image Worksheet' }}
      />
      <Stack.Screen 
        name="ai-chat" 
        options={{ title: 'AI Assistant' }}
      />
    </Stack>
  );
}