import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: styles.contentStyle,
        headerStyle: styles.headerStyle,
        headerTintColor: COLORS.surface,
        headerBackTitle: 'Back',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Sign In',
          headerShown: false // Keep login without header for better UX
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ title: 'Create Account' }} 
      />
      <Stack.Screen 
        name="pending" 
        options={{ title: 'Account Pending' }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: COLORS.background,
  },
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
});