import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface TeacherStatsProps {
  totalWorksheets: number;
  studentsReached: number;
  favoriteSubject: string;
  weeklyGrowth: number;
}

export function TeacherStats({ 
  totalWorksheets, 
  studentsReached, 
  favoriteSubject, 
  weeklyGrowth 
}: TeacherStatsProps) {
  const stats = [
    {
      id: 'worksheets',
      icon: <BookOpen size={20} color={COLORS.education.primary} />,
      value: totalWorksheets.toString(),
      label: 'Worksheets Created',
      color: COLORS.education.primary,
    },
    {
      id: 'students',
      icon: <Users size={20} color={COLORS.accent} />,
      value: studentsReached.toString(),
      label: 'Students Reached',
      color: COLORS.accent,
    },
    {
      id: 'subject',
      icon: <Award size={20} color={COLORS.secondary} />,
      value: favoriteSubject,
      label: 'Top Subject',
      color: COLORS.secondary,
    },
    {
      id: 'growth',
      icon: <TrendingUp size={20} color={COLORS.success} />,
      value: `+${weeklyGrowth}%`,
      label: 'Weekly Growth',
      color: COLORS.success,
    },
  ];

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Your Teaching Impact</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
              {stat.icon}
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
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
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});