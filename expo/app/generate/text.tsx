import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { FileText, Wand2, CheckCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WorksheetDownloader } from '@/components/worksheet/WorksheetDownloader';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { worksheetService } from '@/services/worksheet-service';
import { SOUTH_AFRICAN_LANGUAGES, Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function TextGenerationScreen() {
  const [formData, setFormData] = useState({
    prompt: '',
    grade: '',
    subject: '',
    language: 'en',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedWorksheet, setGeneratedWorksheet] = useState<Worksheet | null>(null);

  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data: any) => worksheetService.generateWorksheet(data),
    onSuccess: (worksheet) => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      
      setGeneratedWorksheet(worksheet);
    },
    onError: (error) => {
      Alert.alert('Generation Failed', error.message);
    },
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Please describe what you want to generate';
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    try {
      await generateMutation.mutateAsync({
        type: 'text',
        content: formData.prompt.trim(),
        grade: formData.grade.trim(),
        subject: formData.subject.trim(),
        language: formData.language,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  if (generateMutation.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Generating Worksheet' }} />
        <LoadingSpinner message="Creating your AI-powered worksheet..." />
      </SafeAreaView>
    );
  }

  if (generatedWorksheet) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Worksheet Generated' }} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.successCard}>
            <View style={styles.successHeader}>
              <CheckCircle size={32} color={COLORS.success} />
              <Text style={styles.successTitle}>Worksheet Generated!</Text>
              <Text style={styles.successSubtitle}>{generatedWorksheet.title}</Text>
            </View>
            
            <WorksheetDownloader worksheet={generatedWorksheet} />
            
            <View style={styles.actionButtons}>
              <Button
                title="Generate Another"
                onPress={() => {
                  setGeneratedWorksheet(null);
                  setFormData({ prompt: '', grade: '', subject: '', language: 'en' });
                }}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="View History"
                onPress={() => router.replace('/(tabs)/history')}
                variant="primary"
                style={styles.actionButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Generate from Text' }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.headerCard}>
            <View style={styles.header}>
              <FileText size={32} color={COLORS.primary} />
              <Text style={styles.title}>Text-Based Generation</Text>
              <Text style={styles.subtitle}>
                Describe what you want and our AI will create a custom worksheet
              </Text>
            </View>
          </Card>

          <Card style={styles.formCard}>
            <Input
              label="Worksheet Description"
              value={formData.prompt}
              onChangeText={(value) => updateField('prompt', value)}
              error={errors.prompt}
              placeholder="e.g., Create a math worksheet with 10 addition problems for Grade 3 students..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              required
              testID="prompt-input"
            />

            <View style={styles.row}>
              <Input
                label="Grade"
                value={formData.grade}
                onChangeText={(value) => updateField('grade', value)}
                error={errors.grade}
                placeholder="e.g., Grade 5"
                containerStyle={styles.halfInput}
                required
                testID="grade-input"
              />

              <Input
                label="Subject"
                value={formData.subject}
                onChangeText={(value) => updateField('subject', value)}
                error={errors.subject}
                placeholder="e.g., Mathematics"
                containerStyle={styles.halfInput}
                required
                testID="subject-input"
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Language</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.language}
                  onValueChange={(value) => updateField('language', value)}
                  style={styles.picker}
                  testID="language-picker"
                >
                  {SOUTH_AFRICAN_LANGUAGES.map((lang) => (
                    <Picker.Item
                      key={lang.code}
                      label={lang.name}
                      value={lang.code}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Button
              title="Generate Worksheet"
              onPress={handleGenerate}
              loading={generateMutation.isPending}
              style={styles.generateButton}
              testID="generate-button"
            />
          </Card>

          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Wand2 size={20} color={COLORS.secondary} />
              <Text style={styles.tipsTitle}>Tips for Better Results</Text>
            </View>
            <Text style={styles.tip}>• Be specific about the type of questions you want</Text>
            <Text style={styles.tip}>• Include difficulty level and number of questions</Text>
            <Text style={styles.tip}>• Mention any specific topics or themes</Text>
            <Text style={styles.tip}>• Specify if you want answer keys included</Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    marginBottom: SPACING.md,
  },
  pickerLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  picker: {
    height: 50,
  },
  generateButton: {
    marginTop: SPACING.lg,
  },
  tipsCard: {
    backgroundColor: COLORS.secondary + '10',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  tip: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  successCard: {
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.success,
    marginTop: SPACING.sm,
  },
  successSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});