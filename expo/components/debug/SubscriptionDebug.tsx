import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { useSubscription } from '@/hooks/subscription-store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export function SubscriptionDebug() {
  const { user, isAuthenticated } = useAuth();
  const { subscription, canGenerateWorksheet, hasActiveSubscription, hasCredits } = useSubscription();

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐛 Debug Info</Text>
      <Text style={styles.item}>Authenticated: {isAuthenticated ? '✅' : '❌'}</Text>
      <Text style={styles.item}>User Status: {user?.status || 'none'}</Text>
      <Text style={styles.item}>Has Active Sub: {hasActiveSubscription ? '✅' : '❌'}</Text>
      <Text style={styles.item}>Has Credits: {hasCredits ? '✅' : '❌'}</Text>
      <Text style={styles.item}>Can Generate: {canGenerateWorksheet ? '✅' : '❌'}</Text>
      <Text style={styles.item}>Credits: {subscription?.creditsRemaining || 0}/{subscription?.creditsTotal || 0}</Text>
      <Text style={styles.item}>Sub Status: {subscription?.status || 'none'}</Text>
      <Text style={styles.item}>Expires: {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'none'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  item: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
});