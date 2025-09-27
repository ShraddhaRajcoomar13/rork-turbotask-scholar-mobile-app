import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Image, User, BookOpen, Download, Zap, MessageCircle } from 'lucide-react-native';
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
  onQuickGenerate?: () => void;
  onAIChat?: () => void;
  canGenerate: boolean;
}

export function QuickActions({
  onGenerateText,
  onGenerateImage,
  onViewHistory,
  onSettings,
  onQuickGenerate,
  onAIChat,
  canGenerate,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'ai-chat',
      title: 'AI Assistant',
      subtitle: 'Chat to create worksheets',
      icon: <MessageCircle size={24} color={canGenerate ? COLORS.secondary : COLORS.text.light} />,
      onPress: onAIChat || onGenerateText,
      disabled: !canGenerate,
    },
    {
      id: 'quick',
      title: 'Quick Generate',
      subtitle: 'Fast worksheet creation',
      icon: <Zap size={24} color={canGenerate ? COLORS.accent : COLORS.text.light} />,
      onPress: onQuickGenerate || onGenerateText,
      disabled: !canGenerate,
    },
    {
      id: 'text',
      title: 'Create from Text',
      subtitle: 'Describe your worksheet',
      icon: <FileText size={24} color={canGenerate ? COLORS.primary : COLORS.text.light} />,
      onPress: onGenerateText,
      disabled: !canGenerate,
    },
    {
      id: 'image',
      title: 'Upload Lesson Plan',
      subtitle: 'Convert image to worksheet',
      icon: <Image size={24} color={canGenerate ? COLORS.accent : COLORS.text.light} />,
      onPress: onGenerateImage,
      disabled: !canGenerate,
    },
    {
      id: 'history',
      title: 'My Worksheets',
      subtitle: 'Browse & download',
      icon: <BookOpen size={24} color={COLORS.success} />,
      onPress: onViewHistory,
    },
    {
      id: 'profile',
      title: 'Teacher Profile',
      subtitle: 'Account & preferences',
      icon: <User size={24} color={COLORS.text.secondary} />,
      onPress: onSettings,
    },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.titleContainer}>
        <Download size={20} color={COLORS.primary} />
        <Text style={styles.title}>Quick Actions</Text>
      </View>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  action: {
    flex: 1,
    minWidth: '30%',
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