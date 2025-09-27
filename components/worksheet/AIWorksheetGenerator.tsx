import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Sparkles, FileText, Wand2 } from 'lucide-react-native';
import { createRorkTool, useRorkAgent } from "@rork/toolkit-sdk";
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useSubscription } from '@/hooks/subscription-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface AIWorksheetGeneratorProps {
  onSuccess?: (worksheet: any) => void;
}

export function AIWorksheetGenerator({ onSuccess }: AIWorksheetGeneratorProps) {
  const [input, setInput] = useState('');

  
  const { subscription, canGenerateWorksheet } = useSubscription();
  const queryClient = useQueryClient();

  const generateWorksheetMutation = useMutation({
    mutationFn: async (worksheetData: any) => {
      return apiService.generateWorksheet(worksheetData);
    },
    onSuccess: (worksheet) => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      onSuccess?.(worksheet);
    },
    onError: (error) => {
      Alert.alert('Generation Failed', error.message);
    },
  });

  const { messages, error, sendMessage } = useRorkAgent({
    tools: {
      generateWorksheet: createRorkTool({
        description: "Generate a comprehensive worksheet based on the provided parameters",
        zodSchema: z.object({
          subject: z.string().describe("The subject for the worksheet"),
          grade: z.string().describe("The grade level for the worksheet"),
          topic: z.string().describe("The specific topic or learning objective"),
          questionCount: z.number().describe("Number of questions to include"),
          difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
          includeAnswerKey: z.boolean().describe("Whether to include an answer key"),
          language: z.string().describe("Language for the worksheet").default("en"),
        }),
        async execute(input) {
          if (!canGenerateWorksheet) {
            return 'No credits remaining. Please upgrade your subscription.';
          }

          const worksheetData = {
            type: 'text' as const,
            content: `Create a ${input.subject} worksheet for ${input.grade} students on the topic: ${input.topic}. Include ${input.questionCount} questions at ${input.difficulty} difficulty level. ${input.includeAnswerKey ? 'Include an answer key.' : 'Do not include an answer key.'}`,
            grade: input.grade,
            subject: input.subject,
            language: input.language,
            prompt: `Generate ${input.questionCount} ${input.difficulty} level questions about ${input.topic}`,
          };

          try {
            const worksheet = await generateWorksheetMutation.mutateAsync(worksheetData);
            return `Worksheet "${worksheet.title}" generated successfully! You can download it now.`;
          } catch (error) {
            return `Failed to generate worksheet: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        },
      }),
      suggestTopics: createRorkTool({
        description: "Suggest relevant topics for a given subject and grade",
        zodSchema: z.object({
          subject: z.string().describe("The subject to suggest topics for"),
          grade: z.string().describe("The grade level"),
        }),
        execute(input) {
          const topics = getTopicsForSubject(input.subject, input.grade);
          return `Here are some relevant topics for ${input.subject} in ${input.grade}: ${topics.join(', ')}`;
        },
      }),
    },
  });

  const getTopicsForSubject = (subject: string, grade: string) => {
    const topicMap: Record<string, string[]> = {
      'Mathematics': ['Addition and Subtraction', 'Multiplication and Division', 'Fractions', 'Geometry', 'Measurement', 'Data Handling'],
      'English': ['Reading Comprehension', 'Grammar', 'Creative Writing', 'Vocabulary', 'Poetry', 'Literature'],
      'Natural Sciences': ['Life and Living', 'Matter and Materials', 'Energy and Change', 'Earth and Beyond'],
      'Social Sciences': ['History', 'Geography', 'Civics', 'Economics'],
    };
    return topicMap[subject] || ['General Topics'];
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!canGenerateWorksheet) {
      Alert.alert(
        'No Credits Remaining',
        'You need credits to generate worksheets. Please upgrade your subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {} }
        ]
      );
      return;
    }

    await sendMessage(input);
    setInput('');
  };

  const downloadWorksheet = async (worksheet: any) => {
    try {
      if (Platform.OS === 'web') {
        // For web, open the PDF in a new tab
        window.open(worksheet.pdfUrl, '_blank');
        return;
      }

      // For mobile, download and share
      const downloadResult = await FileSystem.downloadAsync(
        worksheet.pdfUrl,
        FileSystem.documentDirectory + `${worksheet.title}.pdf`
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        Alert.alert('Success', 'Worksheet downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Unable to download worksheet. Please try again.');
    }
  };

  const renderMessage = (message: any, index: number) => (
    <View key={message.id} style={styles.messageContainer}>
      <View style={[
        styles.messageBubble,
        message.role === 'user' ? styles.userMessage : styles.assistantMessage
      ]}>
        {message.parts.map((part: any, partIndex: number) => {
          switch (part.type) {
            case 'text':
              return (
                <Text key={partIndex} style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
                ]}>
                  {part.text}
                </Text>
              );
            case 'tool':
              if (part.state === 'output-available' && part.toolName === 'generateWorksheet') {
                return (
                  <View key={partIndex} style={styles.worksheetResult}>
                    <View style={styles.worksheetHeader}>
                      <FileText size={20} color={COLORS.success} />
                      <Text style={styles.worksheetTitle}>Worksheet Generated!</Text>
                    </View>
                    <Text style={styles.worksheetInfo}>
                      {part.output.title}
                    </Text>
                    <Button
                      title="Download PDF"
                      onPress={() => downloadWorksheet(part.output)}
                      style={styles.downloadButton}
                      size="small"
                    />
                  </View>
                );
              }
              return (
                <View key={partIndex} style={styles.toolCall}>
                  <Wand2 size={16} color={COLORS.primary} />
                  <Text style={styles.toolText}>
                    {part.state === 'input-streaming' || part.state === 'input-available' 
                      ? `Generating ${part.toolName}...` 
                      : `Completed ${part.toolName}`}
                  </Text>
                </View>
              );
            default:
              return null;
          }
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <Sparkles size={32} color={COLORS.secondary} />
          <Text style={styles.title}>AI Worksheet Assistant</Text>
          <Text style={styles.subtitle}>
            Chat with AI to create personalized worksheets instantly
          </Text>
          {subscription && (
            <View style={styles.creditsContainer}>
              <Text style={styles.creditsText}>
                Credits: {subscription.creditsRemaining}/{subscription.creditsTotal}
              </Text>
            </View>
          )}
        </View>
      </Card>

      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
        {messages.length === 0 && (
          <Card style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>👋 Welcome to AI Worksheet Generator!</Text>
            <Text style={styles.welcomeText}>
              Try asking me things like:
            </Text>
            <View style={styles.exampleContainer}>
              <TouchableOpacity 
                style={styles.exampleButton}
                onPress={() => setInput('Create a Grade 5 Mathematics worksheet on fractions with 10 questions')}
              >
                <Text style={styles.exampleText}>
                  &quot;Create a Grade 5 Mathematics worksheet on fractions with 10 questions&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.exampleButton}
                onPress={() => setInput('Generate an English comprehension worksheet for Grade 3')}
              >
                <Text style={styles.exampleText}>
                  &quot;Generate an English comprehension worksheet for Grade 3&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.exampleButton}
                onPress={() => setInput('What topics should I cover in Grade 7 Natural Sciences?')}
              >
                <Text style={styles.exampleText}>
                  &quot;What topics should I cover in Grade 7 Natural Sciences?&quot;
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {messages.map(renderMessage)}

        {generateWorksheetMutation.isPending && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
            <Text style={styles.loadingText}>Generating your worksheet...</Text>
          </View>
        )}

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>Error: {error.message}</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Input
          value={input}
          onChangeText={setInput}
          placeholder="Ask me to create a worksheet or suggest topics..."
          multiline
          style={styles.input}
          containerStyle={styles.inputWrapper}
        />
        <Button
          title="Send"
          onPress={handleSendMessage}
          disabled={!input.trim() || generateWorksheetMutation.isPending}
          style={styles.sendButton}
          size="small"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary + '05',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  creditsContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 16,
  },
  creditsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  chatContent: {
    paddingBottom: SPACING.lg,
  },
  welcomeCard: {
    backgroundColor: COLORS.secondary + '10',
    marginBottom: SPACING.md,
  },
  welcomeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  exampleContainer: {
    gap: SPACING.sm,
  },
  exampleButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exampleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  messageBubble: {
    padding: SPACING.md,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.surface,
  },
  assistantMessageText: {
    color: COLORS.text.primary,
  },
  worksheetResult: {
    backgroundColor: COLORS.success + '10',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  worksheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  worksheetTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  worksheetInfo: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  downloadButton: {
    backgroundColor: COLORS.success,
  },
  toolCall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  toolText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  errorCard: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    marginRight: SPACING.md,
  },
  input: {
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: SPACING.lg,
  },
});