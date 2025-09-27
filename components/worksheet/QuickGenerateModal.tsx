import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Wand2, FileText } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { SOUTH_AFRICAN_LANGUAGES } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface QuickGenerateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickGenerateModal({ visible, onClose, onSuccess }: QuickGenerateModalProps) {
  const [formData, setFormData] = useState({
    prompt: '',
    grade: '',
    subject: '',
    language: 'en',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiService.generateWorksheet(data),
    onSuccess: (worksheet) => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      
      console.log('Worksheet generated successfully:', worksheet.title);
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Generation failed:', error);
    },
  });

  const resetForm = () => {
    setFormData({
      prompt: '',
      grade: '',
      subject: '',
      language: 'en',
    });
    setErrors({});
  };

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
    } catch {
      // Error handled in mutation
    }
  };

  const handleClose = () => {
    if (!generateMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Generate</Text>
          <Button
            title="✕"
            onPress={handleClose}
            variant="ghost"
            size="small"
            style={styles.closeButton}
            disabled={generateMutation.isPending}
            testID="close-modal"
          />
        </View>

        {generateMutation.isPending ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Creating your AI-powered worksheet..." />
          </View>
        ) : (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Card style={styles.formCard}>
                <View style={styles.iconHeader}>
                  <Wand2 size={32} color={COLORS.primary} />
                  <Text style={styles.subtitle}>
                    Describe what you want and we&apos;ll create it instantly
                  </Text>
                </View>

                <Input
                  label="Worksheet Description"
                  value={formData.prompt}
                  onChangeText={(value) => updateField('prompt', value)}
                  error={errors.prompt}
                  placeholder="e.g., Create 10 multiplication problems for Grade 3..."
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                  required
                  testID="quick-prompt-input"
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
                    testID="quick-grade-input"
                  />

                  <Input
                    label="Subject"
                    value={formData.subject}
                    onChangeText={(value) => updateField('subject', value)}
                    error={errors.subject}
                    placeholder="e.g., Mathematics"
                    containerStyle={styles.halfInput}
                    required
                    testID="quick-subject-input"
                  />
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Language</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.language}
                      onValueChange={(value) => updateField('language', value)}
                      style={styles.picker}
                      testID="quick-language-picker"
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
                  testID="quick-generate-button"
                />
              </Card>

              <Card style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <FileText size={20} color={COLORS.secondary} />
                  <Text style={styles.tipsTitle}>Quick Tips</Text>
                </View>
                <Text style={styles.tip}>• Be specific about question types and difficulty</Text>
                <Text style={styles.tip}>• Include the number of questions you want</Text>
                <Text style={styles.tip}>• Mention if you need answer keys</Text>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
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
});