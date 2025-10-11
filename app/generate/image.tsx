import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Camera, Upload, X, FileImage, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WorksheetDownloader } from '@/components/worksheet/WorksheetDownloader';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { worksheetService } from '@/services/worksheet-service';
import { SOUTH_AFRICAN_LANGUAGES, Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function ImageGenerationScreen() {
  const [formData, setFormData] = useState({
    image: null as string | null,
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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.image) {
      newErrors.image = 'Please upload or take a photo of your lesson plan';
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
        type: 'image',
        content: formData.image!,
        prompt: formData.prompt.trim(),
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
        <LoadingSpinner message="Analyzing your image and creating worksheet..." />
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
                  setFormData({ image: null, prompt: '', grade: '', subject: '', language: 'en' });
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
      <Stack.Screen options={{ title: 'Generate from Image' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <FileImage size={32} color={COLORS.accent} />
            <Text style={styles.title}>Image-Based Generation</Text>
            <Text style={styles.subtitle}>
              Upload a lesson plan or educational material and we'll create a worksheet
            </Text>
          </View>
        </Card>

        <Card style={styles.imageCard}>
          <Text style={styles.sectionTitle}>Upload Image</Text>
          
          {!formData.image ? (
            <View style={styles.uploadArea}>
              <FileImage size={48} color={COLORS.text.light} />
              <Text style={styles.uploadText}>
                Upload a lesson plan, textbook page, or educational material
              </Text>
              <View style={styles.uploadButtons}>
                <Button
                  title="Take Photo"
                  onPress={takePhoto}
                  variant="outline"
                  size="small"
                  style={styles.uploadButton}
                />
                <Button
                  title="Choose from Gallery"
                  onPress={pickImage}
                  variant="outline"
                  size="small"
                  style={styles.uploadButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.imagePreview}>
              <Image source={{ uri: formData.image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <X size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          )}
          
          {errors.image && (
            <Text style={styles.errorText}>{errors.image}</Text>
          )}
        </Card>

        <Card style={styles.formCard}>
          <Input
            label="Additional Instructions (Optional)"
            value={formData.prompt}
            onChangeText={(value) => updateField('prompt', value)}
            placeholder="e.g., Focus on multiplication tables, include word problems..."
            multiline
            numberOfLines={3}
            style={styles.textArea}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  imageCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  uploadArea: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadButton: {
    minWidth: 120,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  textArea: {
    height: 80,
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