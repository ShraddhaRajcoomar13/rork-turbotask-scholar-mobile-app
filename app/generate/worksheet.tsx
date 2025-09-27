import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Image
} from 'react-native';
import { router, Stack } from 'expo-router';

import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { 
  FileText, 
  Wand2, 
  Camera, 
  Image as ImageIcon, 
  Upload,
  BookOpen,
  GraduationCap,
  Globe,
  Sparkles
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { worksheetService } from '@/services/worksheet-service';
import { SOUTH_AFRICAN_LANGUAGES } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useSubscription } from '@/hooks/subscription-store';

type GenerationType = 'text' | 'image';

const GRADE_OPTIONS = [
  'Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'English', 'Afrikaans', 'Natural Sciences', 'Social Sciences',
  'Technology', 'Arts and Culture', 'Life Orientation', 'Economic Management Sciences',
  'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Accounting',
  'Business Studies', 'Tourism', 'Consumer Studies', 'Information Technology'
];

export default function WorksheetGeneratorScreen() {
  const [generationType, setGenerationType] = useState<GenerationType>('text');
  const [formData, setFormData] = useState({
    prompt: '',
    grade: '',
    subject: '',
    language: 'en',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const { subscription } = useSubscription();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      return worksheetService.generateWorksheet(data);
    },
    onSuccess: (worksheet) => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      
      Alert.alert(
        '🎉 Worksheet Generated!',
        'Your AI-powered worksheet has been created successfully and is ready for download.',
        [
          { 
            text: 'View & Download', 
            onPress: () => router.replace('/(tabs)/history')
          },
          { 
            text: 'Generate Another', 
            onPress: () => resetForm(),
            style: 'cancel'
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert(
        'Generation Failed', 
        error.message || 'Unable to generate worksheet. Please check your connection and try again.',
        [{ text: 'Try Again' }]
      );
    },
  });

  const resetForm = () => {
    setFormData({ prompt: '', grade: '', subject: '', language: 'en' });
    setSelectedImage(null);
    setErrors({});
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setGenerationType('image');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
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
        setSelectedImage(result.assets[0].uri);
        setGenerationType('image');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (generationType === 'text' && !formData.prompt.trim()) {
      newErrors.prompt = 'Please describe what you want to generate';
    }

    if (generationType === 'image' && !selectedImage) {
      newErrors.image = 'Please select or take a photo of your lesson plan';
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'Please select a grade';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select a subject';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    // Check credits
    if (!subscription || subscription.creditsRemaining <= 0) {
      Alert.alert(
        'No Credits Remaining',
        'You need credits to generate worksheets. Please upgrade your subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/subscription') }
        ]
      );
      return;
    }

    try {
      await generateMutation.mutateAsync({
        type: generationType,
        content: generationType === 'image' ? selectedImage! : formData.prompt.trim(),
        grade: formData.grade.trim(),
        subject: formData.subject.trim(),
        language: formData.language,
        prompt: generationType === 'image' ? formData.prompt.trim() : undefined,
      });
    } catch (error) {
      console.error('Generation error:', error);
    }
  };

  if (generateMutation.isPending) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Generating Worksheet' }} />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingTitle}>Creating Your Worksheet</Text>
          <Text style={styles.loadingSubtitle}>
            Our AI is analyzing your content and generating a professional worksheet...
          </Text>
          <View style={styles.loadingSteps}>
            <Text style={styles.loadingStep}>✓ Processing content</Text>
            <Text style={styles.loadingStep}>⏳ Generating questions</Text>
            <Text style={styles.loadingStep}>⏳ Creating PDF</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Generate Worksheet',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.surface,
      }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Sparkles size={32} color={COLORS.secondary} />
              </View>
              <Text style={styles.title}>AI Worksheet Generator</Text>
              <Text style={styles.subtitle}>
                Create professional worksheets in seconds using AI technology
              </Text>
              {subscription && (
                <View style={styles.creditsContainer}>
                  <Text style={styles.creditsText}>
                    Credits remaining: {subscription.creditsRemaining}/{subscription.creditsTotal}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Generation Type Selector */}
          <Card style={styles.typeCard}>
            <Text style={styles.sectionTitle}>Choose Generation Method</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  generationType === 'text' && styles.typeButtonActive
                ]}
                onPress={() => {
                  setGenerationType('text');
                  setSelectedImage(null);
                }}
                testID="text-generation-button"
              >
                <FileText 
                  size={24} 
                  color={generationType === 'text' ? COLORS.surface : COLORS.primary} 
                />
                <Text style={[
                  styles.typeButtonText,
                  generationType === 'text' && styles.typeButtonTextActive
                ]}>
                  Text Description
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  generationType === 'image' && styles.typeButtonActive
                ]}
                onPress={() => setGenerationType('image')}
                testID="image-generation-button"
              >
                <ImageIcon 
                  size={24} 
                  color={generationType === 'image' ? COLORS.surface : COLORS.primary} 
                />
                <Text style={[
                  styles.typeButtonText,
                  generationType === 'image' && styles.typeButtonTextActive
                ]}>
                  Upload Image
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Content Input */}
          <Card style={styles.formCard}>
            {generationType === 'text' ? (
              <View>
                <Text style={styles.sectionTitle}>Describe Your Worksheet</Text>
                <Input
                  label="Worksheet Description"
                  value={formData.prompt}
                  onChangeText={(value) => updateField('prompt', value)}
                  error={errors.prompt}
                  placeholder="e.g., Create a math worksheet with 10 addition problems for Grade 3 students focusing on two-digit numbers..."
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                  required
                  testID="prompt-input"
                />
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Upload Lesson Plan</Text>
                {selectedImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imageUploadContainer}>
                    <View style={styles.uploadButtons}>
                      <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                        <Camera size={24} color={COLORS.primary} />
                        <Text style={styles.uploadButtonText}>Take Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Upload size={24} color={COLORS.primary} />
                        <Text style={styles.uploadButtonText}>Choose Image</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                  </View>
                )}
                
                {selectedImage && (
                  <Input
                    label="Additional Instructions (Optional)"
                    value={formData.prompt}
                    onChangeText={(value) => updateField('prompt', value)}
                    placeholder="Any specific requirements or focus areas..."
                    multiline
                    numberOfLines={2}
                    style={styles.additionalPrompt}
                    testID="additional-prompt-input"
                  />
                )}
              </View>
            )}
          </Card>

          {/* Worksheet Details */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Worksheet Details</Text>
            
            <View style={styles.row}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  <GraduationCap size={16} color={COLORS.primary} /> Grade
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.grade}
                    onValueChange={(value) => updateField('grade', value)}
                    style={styles.picker}
                    testID="grade-picker"
                  >
                    <Picker.Item label="Select Grade" value="" />
                    {GRADE_OPTIONS.map((grade) => (
                      <Picker.Item key={grade} label={grade} value={grade} />
                    ))}
                  </Picker>
                </View>
                {errors.grade && <Text style={styles.errorText}>{errors.grade}</Text>}
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  <BookOpen size={16} color={COLORS.primary} /> Subject
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.subject}
                    onValueChange={(value) => updateField('subject', value)}
                    style={styles.picker}
                    testID="subject-picker"
                  >
                    <Picker.Item label="Select Subject" value="" />
                    {SUBJECT_OPTIONS.map((subject) => (
                      <Picker.Item key={subject} label={subject} value={subject} />
                    ))}
                  </Picker>
                </View>
                {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>
                <Globe size={16} color={COLORS.primary} /> Language
              </Text>
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
          </Card>

          {/* Generate Button */}
          <Button
            title="Generate Worksheet"
            onPress={handleGenerate}
            loading={generateMutation.isPending}
            style={styles.generateButton}
            testID="generate-button"
          />

          {/* Tips */}
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Wand2 size={20} color={COLORS.secondary} />
              <Text style={styles.tipsTitle}>Pro Tips for Better Results</Text>
            </View>
            <Text style={styles.tip}>• Be specific about question types and difficulty levels</Text>
            <Text style={styles.tip}>• Include the number of questions you want (e.g., &quot;10 questions&quot;)</Text>
            <Text style={styles.tip}>• Mention if you want an answer key included</Text>
            <Text style={styles.tip}>• For images: ensure text is clear and well-lit</Text>
            <Text style={styles.tip}>• Specify any curriculum standards or learning objectives</Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  loadingSteps: {
    alignItems: 'flex-start',
  },
  loadingStep: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary + '05',
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  creditsContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 20,
  },
  creditsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  typeCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: COLORS.surface,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  removeImageButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: 8,
  },
  removeImageText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  imageUploadContainer: {
    marginBottom: SPACING.md,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  additionalPrompt: {
    marginTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  pickerContainer: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  pickerLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
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
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  generateButton: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
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
    lineHeight: 20,
  },
});