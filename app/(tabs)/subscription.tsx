import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PricingCard } from '@/components/subscription/PricingCard';
import { useSubscription } from '@/hooks/subscription-store';
import { SubscriptionTier } from '@/types/subscription';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function SubscriptionScreen() {
  const { subscription, tiers, hasActiveSubscription, verifyPayment, isVerifyingPayment, isLoading } = useSubscription();

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (__DEV__) {
      Alert.alert(
        'Demo Mode',
        `In production, this would open the Yoco payment link for ${tier.name} (R${tier.price}/month)`,
        [{ text: 'OK' }]
      );
      return;
    }

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

          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isPopular={tier.id === 'professional'}
              onSelect={handleSubscribe}
            />
          ))}
        </View>

        <Card style={styles.verifyCard}>
          <Text style={styles.verifyTitle}>Already Paid?</Text>
          <Text style={styles.verifyDescription}>
            If you&apos;ve completed payment, verify it here to activate your subscription.
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