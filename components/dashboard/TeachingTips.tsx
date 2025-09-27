import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lightbulb, RefreshCw, Heart } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface TeachingTip {
  id: string;
  title: string;
  content: string;
  category: 'engagement' | 'assessment' | 'differentiation' | 'technology' | 'classroom';
}

export function TeachingTips() {
  const [currentTip, setCurrentTip] = useState<TeachingTip | null>(null);

  const tips = React.useMemo<TeachingTip[]>(() => [
    {
      id: '1',
      title: 'Visual Learning Magic',
      content: 'Use colorful diagrams and infographics in your worksheets to help visual learners grasp complex concepts faster.',
      category: 'differentiation',
    },
    {
      id: '2',
      title: 'Real-World Connections',
      content: 'Connect lesson content to students\' daily lives. Math problems about shopping or science experiments with household items work wonders!',
      category: 'engagement',
    },
    {
      id: '3',
      title: 'Gamify Your Assessments',
      content: 'Turn worksheets into treasure hunts or puzzles. Students learn better when they\'re having fun!',
      category: 'assessment',
    },
    {
      id: '4',
      title: 'Differentiated Difficulty',
      content: 'Create worksheets with varying difficulty levels - bronze, silver, and gold questions to challenge all learners.',
      category: 'differentiation',
    },
    {
      id: '5',
      title: 'Cultural Relevance',
      content: 'Include South African contexts, local heroes, and familiar scenarios to make learning more relatable.',
      category: 'engagement',
    },
    {
      id: '6',
      title: 'Quick Check-ins',
      content: 'Add reflection questions at the end of worksheets: "What was challenging?" or "How will you use this?"',
      category: 'assessment',
    },
    {
      id: '7',
      title: 'Collaborative Learning',
      content: 'Design worksheets that encourage pair work or group discussions for deeper understanding.',
      category: 'classroom',
    },
    {
      id: '8',
      title: 'Technology Integration',
      content: 'Include QR codes linking to videos or interactive content to extend learning beyond the worksheet.',
      category: 'technology',
    },
  ], []);

  const getRandomTip = React.useCallback(() => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setCurrentTip(tips[randomIndex]);
  }, [tips]);

  useEffect(() => {
    getRandomTip();
  }, [getRandomTip]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'engagement': return COLORS.accent;
      case 'assessment': return COLORS.education.primary;
      case 'differentiation': return COLORS.success;
      case 'technology': return COLORS.info;
      case 'classroom': return COLORS.secondary;
      default: return COLORS.text.secondary;
    }
  };

  if (!currentTip) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Lightbulb size={20} color={COLORS.secondary} />
          <Text style={styles.title}>Teaching Tip</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={getRandomTip}
          testID="refresh-tip"
        >
          <RefreshCw size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tipContent}>
        <View style={styles.tipHeader}>
          <Text style={styles.tipTitle}>{currentTip.title}</Text>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(currentTip.category) + '20' }
          ]}>
            <Text style={[
              styles.categoryText,
              { color: getCategoryColor(currentTip.category) }
            ]}>
              {currentTip.category}
            </Text>
          </View>
        </View>
        
        <Text style={styles.tipText}>{currentTip.content}</Text>
        
        <View style={styles.footer}>
          <Heart size={14} color={COLORS.accent} />
          <Text style={styles.footerText}>Happy Teaching!</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.education.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tipContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    ...TYPOGRAPHY.lesson,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  categoryText: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
});