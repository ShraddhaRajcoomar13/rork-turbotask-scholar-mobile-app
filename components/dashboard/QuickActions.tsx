import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Image, History, Settings } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  onGenerateText: () => void;
  onGenerateImage: () => void;
  onViewHistory: () => void;
  onSettings: () => void;
  canGenerate: boolean;
}

export function QuickActions({
  onGenerateText,
  onGenerateImage,
  onViewHistory,
  onSettings,
  canGenerate,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'text',
      title: 'Text Prompt',
      subtitle: 'Generate from description',
      icon: <FileText size={24} color={canGenerate ? COLORS.primary : COLORS.text.light} />,
      onPress: onGenerateText,
      disabled: !canGenerate,
    },
    {
      id: 'image',
      title: 'Upload Image',
      subtitle: 'Generate from lesson plan',
      icon: <Image size={24} color={canGenerate ? COLORS.accent : COLORS.text.light} />,
      onPress: onGenerateImage,
      disabled: !canGenerate,
    },
    {
      id: 'history',
      title: 'History',
      subtitle: 'View past worksheets',
      icon: <History size={24} color={COLORS.secondary} />,
      onPress: onViewHistory,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Account & preferences',
      icon: <Settings size={24} color={COLORS.text.secondary} />,
      onPress: onSettings,
    },
  ];

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.action,
              action.disabled && styles.actionDisabled,
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            testID={`quick-action-${action.id}`}
          >
            <View style={styles.actionIcon}>
              {action.icon}
            </View>
            <Text style={[
              styles.actionTitle,
              action.disabled && styles.actionTitleDisabled,
            ]}>
              {action.title}
            </Text>
            <Text style={[
              styles.actionSubtitle,
              action.disabled && styles.actionSubtitleDisabled,
            ]}>
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  action: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  actionTitleDisabled: {
    color: COLORS.text.light,
  },
  actionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  actionSubtitleDisabled: {
    color: COLORS.text.light,
  },
});