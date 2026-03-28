import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { SAMPLE_CREDENTIALS, SUBSCRIPTION_TIERS } from '@/constants/sample-data';

export function DemoInfo() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Accounts</Text>
        <Text style={styles.sectionDescription}>
          Use these sample accounts to test different features:
        </Text>
        
        <View style={styles.accountList}>
          <View style={styles.accountItem}>
            <Text style={styles.accountEmail}>{SAMPLE_CREDENTIALS.teacher.email}</Text>
            <Text style={styles.accountPassword}>Password: {SAMPLE_CREDENTIALS.teacher.password}</Text>
            <Text style={styles.accountDescription}>Professional plan with 18/25 credits</Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountEmail}>{SAMPLE_CREDENTIALS.john.email}</Text>
            <Text style={styles.accountPassword}>Password: {SAMPLE_CREDENTIALS.john.password}</Text>
            <Text style={styles.accountDescription}>Starter plan with 3/10 credits (low credits)</Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountEmail}>{SAMPLE_CREDENTIALS.pending.email}</Text>
            <Text style={styles.accountPassword}>Password: {SAMPLE_CREDENTIALS.pending.password}</Text>
            <Text style={styles.accountDescription}>Pending admin approval</Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountEmail}>{SAMPLE_CREDENTIALS.admin.email}</Text>
            <Text style={styles.accountPassword}>Password: {SAMPLE_CREDENTIALS.admin.password}</Text>
            <Text style={styles.accountDescription}>Admin account</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Plans</Text>
        <Text style={styles.sectionDescription}>
          South African pricing with Yoco payment integration:
        </Text>
        
        <View style={styles.planList}>
          {SUBSCRIPTION_TIERS.map((tier) => (
            <View key={tier.id} style={styles.planItem}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{tier.name}</Text>
                <Text style={styles.planPrice}>R{tier.price}/month</Text>
              </View>
              <Text style={styles.planCredits}>{tier.credits} worksheets included</Text>
              <Text style={styles.planFeatures}>
                {tier.features.slice(0, 3).join(' • ')}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Features to Test</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Login with different account types</Text>
          <Text style={styles.featureItem}>• View subscription status and credits</Text>
          <Text style={styles.featureItem}>• Browse pricing plans</Text>
          <Text style={styles.featureItem}>• Test worksheet generation (when implemented)</Text>
          <Text style={styles.featureItem}>• Experience pending approval flow</Text>
          <Text style={styles.featureItem}>• Admin user management (admin account)</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    margin: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  accountList: {
    gap: SPACING.md,
  },
  accountItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountEmail: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  accountPassword: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  accountDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  planList: {
    gap: SPACING.sm,
  },
  planItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  planPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontWeight: '600',
  },
  planCredits: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  planFeatures: {
    ...TYPOGRAPHY.small,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  featureList: {
    gap: SPACING.xs,
  },
  featureItem: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
});