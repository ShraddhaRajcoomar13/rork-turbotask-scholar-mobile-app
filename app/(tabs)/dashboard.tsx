import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TeacherStats } from '@/components/dashboard/TeacherStats';
import { CurriculumActions } from '@/components/dashboard/CurriculumActions';
import { TeachingTips } from '@/components/dashboard/TeachingTips';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { QuickGenerateModal } from '@/components/worksheet/QuickGenerateModal';
import { useAuth } from '@/hooks/auth-store';
import { useSubscription } from '@/hooks/subscription-store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { canGenerateWorksheet, isLoading, refreshSubscription } = useSubscription();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = React.useState(false);
  const [showQuickGenerate, setShowQuickGenerate] = React.useState(false);

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

  const handleQuickGenerate = () => {
    if (canGenerateWorksheet) {
      setShowQuickGenerate(true);
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

  const handleSubjectSelect = (subject: string) => {
    if (canGenerateWorksheet) {
      router.push({
        pathname: '/generate/text',
        params: { subject }
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.refreshHeader}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw 
            size={20} 
            color={refreshing ? COLORS.text.light : COLORS.text.secondary} 
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {user?.firstName}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Let&apos;s create engaging worksheets for your students
          </Text>
        </View>

        <SubscriptionCard onUpgrade={handleUpgrade} />

        <TeacherStats 
          totalWorksheets={42}
          studentsReached={156}
          favoriteSubject="Mathematics"
          weeklyGrowth={15}
        />

        <CurriculumActions 
          onSubjectSelect={handleSubjectSelect}
          canGenerate={canGenerateWorksheet}
        />

        <TeachingTips />

        <QuickActions
          onGenerateText={handleGenerateText}
          onGenerateImage={handleGenerateImage}
          onViewHistory={handleViewHistory}
          onSettings={handleSettings}
          onQuickGenerate={handleQuickGenerate}
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

      <QuickGenerateModal
        visible={showQuickGenerate}
        onClose={() => setShowQuickGenerate(false)}
        onSuccess={() => {
          console.log('Worksheet generated successfully!');
        }}
      />
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
  refreshHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
});