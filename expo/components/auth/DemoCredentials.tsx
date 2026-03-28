import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SAMPLE_CREDENTIALS } from '@/constants/sample-data';
import { COLORS } from '@/constants/theme';

interface DemoCredentialsProps {
  onSelectCredentials: (email: string, password: string) => void;
}

export function DemoCredentials({ onSelectCredentials }: DemoCredentialsProps) {
  const credentials = [
    {
      title: '🧪 Test Account (Full Credits)',
      email: SAMPLE_CREDENTIALS.test.email,
      password: SAMPLE_CREDENTIALS.test.password,
      description: 'Professional plan with 25/25 credits - Perfect for testing!',
    },
    {
      title: 'Teacher Account (Active Subscription)',
      email: SAMPLE_CREDENTIALS.teacher.email,
      password: SAMPLE_CREDENTIALS.teacher.password,
      description: 'Professional plan with 18/25 credits remaining',
    },
    {
      title: 'Teacher Account (School Plan)',
      email: SAMPLE_CREDENTIALS.john.email,
      password: SAMPLE_CREDENTIALS.john.password,
      description: 'School plan with 45/60 credits remaining',
    },
    {
      title: 'Pending Approval Account',
      email: SAMPLE_CREDENTIALS.pending.email,
      password: SAMPLE_CREDENTIALS.pending.password,
      description: 'Account waiting for admin approval',
    },
    {
      title: 'Admin Account',
      email: SAMPLE_CREDENTIALS.admin.email,
      password: SAMPLE_CREDENTIALS.admin.password,
      description: 'Admin access for user management',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Accounts</Text>
      <Text style={styles.subtitle}>
        Choose a sample account to test different features
      </Text>
      
      <ScrollView style={styles.credentialsList}>
        {credentials.map((cred) => (
          <TouchableOpacity
            key={cred.email}
            style={styles.credentialCard}
            onPress={() => onSelectCredentials(cred.email, cred.password)}
          >
            <Text style={styles.credentialTitle}>{cred.title}</Text>
            <Text style={styles.credentialEmail}>{cred.email}</Text>
            <Text style={styles.credentialPassword}>Password: {cred.password}</Text>
            <Text style={styles.credentialDescription}>{cred.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  credentialsList: {
    maxHeight: 300,
  },
  credentialCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  credentialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  credentialEmail: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  credentialPassword: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  credentialDescription: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});