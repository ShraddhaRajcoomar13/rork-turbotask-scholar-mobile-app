import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/auth-store';
import { useSubscription } from '@/hooks/subscription-store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { canGenerateWorksheet, isLoading, refreshSubscription } = useSubscription();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshSubscription();
    setRefreshing(false);
  }, [refreshSubscription]);

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const handleGenerateText = () => {
    if (canGenerateWorksheet) {
      router.push('/generate/text');
    }
  };

  const handleGenerateImage = () => {
    if (canGenerateWorksheet) {
      router.push('/generate/image');
    }
  };

  const handleViewHistory = () => {
    router.push('/(tabs)/history');
  };

  const handleSettings = () => {
    router.push('/(tabs)/profile');
  };

  const handleUpgrade = () => {
    router.push('/(tabs)/subscription');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {user?.firstName}!
          </Text>
          <Text style={styles.subtitle}>
            Ready to create amazing worksheets?
          </Text>
        </View>

        <SubscriptionCard onUpgrade={handleUpgrade} />

        <QuickActions
          onGenerateText={handleGenerateText}
          onGenerateImage={handleGenerateImage}
          onViewHistory={handleViewHistory}
          onSettings={handleSettings}
          canGenerate={canGenerateWorksheet}
        />

        {!canGenerateWorksheet && (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradeTitle}>Get Started</Text>
            <Text style={styles.upgradeDescription}>
              Subscribe to start generating AI-powered worksheets tailored to your curriculum.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  upgradePrompt: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  upgradeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  upgradeDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});