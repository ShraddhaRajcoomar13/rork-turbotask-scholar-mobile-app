import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Clock } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/auth-store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function PendingApprovalScreen() {
  const { logout, user, refreshProfile } = useAuth();

  const handleRefresh = () => {
    refreshProfile();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <Clock size={64} color={COLORS.secondary} />
          </View>
          
          <Text style={styles.title}>Account Pending Approval</Text>
          
          <Text style={styles.message}>
            Thank you for signing up, {user?.firstName}! Your account is currently under review.
          </Text>
          
          <Text style={styles.description}>
            Our team will review your application and approve your account within 24-48 hours. 
            You'll receive an email notification once your account is approved.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <CheckCircle size={20} color={COLORS.success} />
              <Text style={styles.featureText}>AI-powered worksheet generation</Text>
            </View>
            <View style={styles.feature}>
              <CheckCircle size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Multi-language support</Text>
            </View>
            <View style={styles.feature}>
              <CheckCircle size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Instant PDF downloads</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Check Status"
              onPress={handleRefresh}
              variant="outline"
              style={styles.refreshButton}
            />
            <Button
              title="Sign Out"
              onPress={logout}
              variant="ghost"
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  features: {
    width: '100%',
    marginBottom: SPACING.xl,
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
  actions: {
    width: '100%',
    gap: SPACING.md,
  },
  refreshButton: {
    marginBottom: SPACING.sm,
  },
});