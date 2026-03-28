import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Check, Star } from 'lucide-react-native';
import { SubscriptionTier } from '@/types/subscription';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface PricingCardProps {
  tier: SubscriptionTier;
  isPopular?: boolean;
  onSelect: (tier: SubscriptionTier) => void;
}

export function PricingCard({ tier, isPopular = false, onSelect }: PricingCardProps) {
  const handlePress = async () => {
    if (__DEV__) {
      // In development, just call onSelect
      onSelect(tier);
    } else {
      // In production, open Yoco payment link
      try {
        await Linking.openURL(tier.yocoPaymentLink);
      } catch (error) {
        console.error('Failed to open payment link:', error);
        onSelect(tier);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isPopular && styles.popularContainer
      ]}
      onPress={handlePress}
      testID={`pricing-card-${tier.id}`}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Star size={12} color={COLORS.surface} fill={COLORS.surface} />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.tierName}>{tier.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>R</Text>
          <Text style={styles.price}>{tier.price}</Text>
          <Text style={styles.period}>/month</Text>
        </View>
        <Text style={styles.creditsText}>{tier.credits} worksheets included</Text>
      </View>

      <View style={styles.features}>
        {tier.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Check size={16} color={COLORS.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.selectButton}>
          {__DEV__ ? 'Select Plan' : 'Subscribe Now'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  popularContainer: {
    borderColor: COLORS.accent,
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: SPACING.lg,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  tierName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  currency: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.secondary,
  },
  price: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  period: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  creditsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  features: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  featureText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  selectButton: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
});