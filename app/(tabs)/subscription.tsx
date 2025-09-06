import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Crown, Zap, Star } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSubscription } from '@/hooks/subscription-store';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { SubscriptionTier } from '@/types/subscription';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function SubscriptionScreen() {
  const { subscription, hasActiveSubscription, verifyPayment, isVerifyingPayment } = useSubscription();

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: apiService.getSubscriptionTiers,
  });

  const handleSubscribe = async (tier: SubscriptionTier) => {
    try {
      const supported = await Linking.canOpenURL(tier.yocoPaymentLink);
      if (supported) {
        await Linking.openURL(tier.yocoPaymentLink);
      } else {
        Alert.alert('Error', 'Unable to open payment link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open payment link');
    }
  };

  const handleVerifyPayment = () => {
    Alert.prompt(
      'Verify Payment',
      'Enter your payment ID to verify your subscription:',
      async (paymentId) => {
        if (paymentId) {
          try {
            await verifyPayment(paymentId);
            Alert.alert('Success', 'Payment verified successfully!');
          } catch (error) {
            Alert.alert('Error', 'Failed to verify payment. Please try again.');
          }
        }
      }
    );
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'basic':
        return <Zap size={24} color={COLORS.primary} />;
      case 'premium':
        return <Star size={24} color={COLORS.accent} />;
      case 'enterprise':
        return <Crown size={24} color={COLORS.secondary} />;
      default:
        return <Zap size={24} color={COLORS.primary} />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'basic':
        return COLORS.primary;
      case 'premium':
        return COLORS.accent;
      case 'enterprise':
        return COLORS.secondary;
      default:
        return COLORS.primary;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading subscription plans..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {hasActiveSubscription && subscription && (
          <Card style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>Current Plan</Text>
              <View style={styles.currentPlanBadge}>
                <Text style={styles.currentPlanBadgeText}>
                  {subscription.tier.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.currentPlanDescription}>
              {subscription.creditsRemaining} credits remaining
            </Text>
            <Text style={styles.currentPlanExpiry}>
              Expires on {new Date(subscription.expiresAt).toLocaleDateString()}
            </Text>
          </Card>
        )}

        <View style={styles.tiersContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.sectionDescription}>
            Select the perfect plan for your worksheet generation needs
          </Text>

          {tiers?.map((tier) => {
            const isCurrentTier = subscription?.tier === tier.name;
            const tierColor = getTierColor(tier.name);

            return (
              <Card key={tier.id} style={[
                styles.tierCard,
                isCurrentTier && { borderColor: tierColor, borderWidth: 2 }
              ]}>
                <View style={styles.tierHeader}>
                  <View style={styles.tierInfo}>
                    {getTierIcon(tier.name)}
                    <Text style={styles.tierName}>{tier.name}</Text>
                  </View>
                  <View style={styles.tierPricing}>
                    <Text style={styles.tierPrice}>R{tier.price}</Text>
                    <Text style={styles.tierDuration}>/{tier.duration} days</Text>
                  </View>
                </View>

                <View style={styles.tierCredits}>
                  <Text style={styles.tierCreditsText}>
                    {tier.credits} worksheets included
                  </Text>
                </View>

                <View style={styles.tierFeatures}>
                  {tier.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Check size={16} color={COLORS.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {!isCurrentTier && (
                  <Button
                    title={hasActiveSubscription ? 'Upgrade' : 'Subscribe'}
                    onPress={() => handleSubscribe(tier)}
                    style={[styles.subscribeButton, { backgroundColor: tierColor }]}
                  />
                )}

                {isCurrentTier && (
                  <View style={styles.currentTierBadge}>
                    <Text style={styles.currentTierText}>Current Plan</Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        <Card style={styles.verifyCard}>
          <Text style={styles.verifyTitle}>Already Paid?</Text>
          <Text style={styles.verifyDescription}>
            If you've completed payment, verify it here to activate your subscription.
          </Text>
          <Button
            title="Verify Payment"
            onPress={handleVerifyPayment}
            loading={isVerifyingPayment}
            variant="outline"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  currentPlanCard: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.primary + '10',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  currentPlanTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  currentPlanBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  currentPlanDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  currentPlanExpiry: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  tiersContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  tierCard: {
    marginBottom: SPACING.lg,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    textTransform: 'capitalize',
  },
  tierPricing: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  tierDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  tierCredits: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  tierCreditsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  tierFeatures: {
    marginBottom: SPACING.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  subscribeButton: {
    marginTop: SPACING.sm,
  },
  currentTierBadge: {
    backgroundColor: COLORS.success + '20',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentTierText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: '600',
  },
  verifyCard: {
    alignItems: 'center',
  },
  verifyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  verifyDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});