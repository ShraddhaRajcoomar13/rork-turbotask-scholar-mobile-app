import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function GenerateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerTintColor: COLORS.surface,
        headerBackTitle: 'Back',
        headerTitleStyle: styles.headerTitle,
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

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
});