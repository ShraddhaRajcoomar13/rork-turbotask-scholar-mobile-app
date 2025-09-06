import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CreditCard, Calendar, Zap } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/subscription-store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface SubscriptionCardProps {
  onUpgrade: () => void;
}

export function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const { subscription, hasActiveSubscription } = useSubscription();

  if (!hasActiveSubscription || !subscription) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <CreditCard size={24} color={COLORS.accent} />
          <Text style={styles.title}>No Active Subscription</Text>
        </View>
        <Text style={styles.description}>
          Subscribe to start generating AI-powered worksheets
        </Text>
        <Button
          title="Choose Plan"
          onPress={onUpgrade}
          variant="secondary"
          size="small"
        />
      </Card>
    );
  }

  const expiryDate = new Date(subscription.expiresAt);
  const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Zap size={24} color={COLORS.success} />
        <Text style={styles.title}>{subscription.tier.toUpperCase()} Plan</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{subscription.creditsRemaining}</Text>
          <Text style={styles.statLabel}>Credits Left</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{daysRemaining}</Text>
          <Text style={styles.statLabel}>Days Left</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${(subscription.creditsRemaining / subscription.creditsTotal) * 100}%` 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {subscription.creditsRemaining} of {subscription.creditsTotal} credits
        </Text>
      </View>

      {subscription.creditsRemaining < 5 && (
        <TouchableOpacity style={styles.upgradePrompt} onPress={onUpgrade}>
          <Calendar size={16} color={COLORS.warning} />
          <Text style={styles.upgradeText}>Running low on credits</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  upgradeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
});