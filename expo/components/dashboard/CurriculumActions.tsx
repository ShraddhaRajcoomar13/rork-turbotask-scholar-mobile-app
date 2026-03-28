import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Calculator, 
  Globe, 
  Beaker, 
  BookOpen, 
  Palette, 
  Music,
  Users,
  Brain
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface CurriculumActionsProps {
  onSubjectSelect: (subject: string) => void;
  canGenerate: boolean;
}

export function CurriculumActions({ onSubjectSelect, canGenerate }: CurriculumActionsProps) {
  const subjects: Subject[] = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: <Calculator size={20} color={COLORS.education.primary} />,
      color: COLORS.education.primary,
      description: 'Numbers, algebra, geometry',
    },
    {
      id: 'english',
      name: 'English',
      icon: <BookOpen size={20} color={COLORS.accent} />,
      color: COLORS.accent,
      description: 'Reading, writing, grammar',
    },
    {
      id: 'science',
      name: 'Science',
      icon: <Beaker size={20} color={COLORS.success} />,
      color: COLORS.success,
      description: 'Biology, chemistry, physics',
    },
    {
      id: 'geography',
      name: 'Geography',
      icon: <Globe size={20} color={COLORS.info} />,
      color: COLORS.info,
      description: 'Maps, countries, climate',
    },
    {
      id: 'arts',
      name: 'Arts & Culture',
      icon: <Palette size={20} color={COLORS.secondary} />,
      color: COLORS.secondary,
      description: 'Drawing, history, culture',
    },
    {
      id: 'music',
      name: 'Music',
      icon: <Music size={20} color={COLORS.education.secondary} />,
      color: COLORS.education.secondary,
      description: 'Theory, instruments, rhythm',
    },
    {
      id: 'social',
      name: 'Social Studies',
      icon: <Users size={20} color={COLORS.warning} />,
      color: COLORS.warning,
      description: 'History, civics, society',
    },
    {
      id: 'life-skills',
      name: 'Life Skills',
      icon: <Brain size={20} color={COLORS.education.light} />,
      color: COLORS.education.light,
      description: 'Problem solving, ethics',
    },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Subject</Text>
        <Text style={styles.subtitle}>
          Select a subject to create curriculum-aligned worksheets
        </Text>
      </View>
      
      <View style={styles.subjectsGrid}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            style={[
              styles.subjectCard,
              !canGenerate && styles.subjectCardDisabled,
            ]}
            onPress={() => canGenerate && onSubjectSelect(subject.id)}
            disabled={!canGenerate}
            testID={`subject-${subject.id}`}
          >
            <View style={[
              styles.subjectIcon,
              { backgroundColor: subject.color + '15' }
            ]}>
              {subject.icon}
            </View>
            <Text style={[
              styles.subjectName,
              !canGenerate && styles.subjectNameDisabled,
            ]}>
              {subject.name}
            </Text>
            <Text style={[
              styles.subjectDescription,
              !canGenerate && styles.subjectDescriptionDisabled,
            ]}>
              {subject.description}
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
  header: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  subjectCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  subjectCardDisabled: {
    opacity: 0.5,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  subjectName: {
    ...TYPOGRAPHY.subject,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subjectNameDisabled: {
    color: COLORS.text.light,
  },
  subjectDescription: {
    ...TYPOGRAPHY.small,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  subjectDescriptionDisabled: {
    color: COLORS.text.light,
  },
});