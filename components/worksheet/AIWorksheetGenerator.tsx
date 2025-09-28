import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Sparkles, FileText, Wand2 } from 'lucide-react-native';
// import { createRorkTool, useRorkAgent } from "@rork/toolkit-sdk";
// import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useSubscription } from '@/hooks/subscription-store';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AIWorksheetGeneratorProps {
  onSuccess?: (worksheet: any) => void;
}

export function AIWorksheetGenerator({ onSuccess }: AIWorksheetGeneratorProps) {
  const [input, setInput] = useState('');
  const insets = useSafeAreaInsets();
  
  const { subscription, canGenerateWorksheet } = useSubscription();

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateWorksheetWithAI = async (prompt: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parse the prompt to extract worksheet parameters
      const params = parseWorksheetPrompt(prompt);
      
      // Generate worksheet content using OpenAI API
      const worksheetContent = await generateWorksheetContent({
        prompt,
        subject: params.subject,
        grade: params.grade,
        topic: params.topic,
        questionCount: params.questionCount,
        difficulty: params.difficulty,
        includeAnswerKey: params.includeAnswerKey,
        language: params.language,
      });

      // Create PDF from the generated content
      const pdfUrl = await createWorksheetPDF({
        title: `${params.subject} Worksheet - ${params.grade}`,
        content: worksheetContent,
        grade: params.grade,
        subject: params.subject,
      });
      
      // Create worksheet object
      const worksheet = {
        id: `worksheet-${Date.now()}`,
        title: `${params.subject} Worksheet - ${params.grade}`,
        content: worksheetContent,
        grade: params.grade,
        subject: params.subject,
        language: params.language,
        pdfUrl,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        downloadCount: 0,
      };
      
      // Store worksheet data for download
      const worksheetInfo = {
        title: worksheet.title,
        id: worksheet.id,
        pdfUrl: worksheet.pdfUrl
      };
      
      // Store in a simple way
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        (window as any).lastGeneratedWorksheet = worksheetInfo;
      }
      
      // Trigger success callback
      onSuccess?.(worksheet);
      
      return `Worksheet "${worksheetInfo.title}" generated successfully! You can download it now.`;
    } catch (error) {
      console.error('Worksheet generation error:', error);
      throw error;
    }
  };

  const parseWorksheetPrompt = (prompt: string) => {
    // Simple parsing logic to extract parameters from natural language
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract subject
    let subject = 'Mathematics';
    if (lowerPrompt.includes('english') || lowerPrompt.includes('language')) subject = 'English';
    else if (lowerPrompt.includes('science')) subject = 'Natural Sciences';
    else if (lowerPrompt.includes('social') || lowerPrompt.includes('history') || lowerPrompt.includes('geography')) subject = 'Social Sciences';
    
    // Extract grade
    let grade = 'Grade 5';
    const gradeMatch = prompt.match(/grade\s*(\d+)/i);
    if (gradeMatch) grade = `Grade ${gradeMatch[1]}`;
    
    // Extract question count
    let questionCount = 10;
    const countMatch = prompt.match(/(\d+)\s*questions?/i);
    if (countMatch) questionCount = parseInt(countMatch[1]);
    
    // Extract topic
    let topic = 'General';
    if (lowerPrompt.includes('fraction')) topic = 'Fractions';
    else if (lowerPrompt.includes('addition')) topic = 'Addition';
    else if (lowerPrompt.includes('multiplication')) topic = 'Multiplication';
    else if (lowerPrompt.includes('comprehension')) topic = 'Reading Comprehension';
    
    return {
      subject,
      grade,
      topic,
      questionCount,
      difficulty: 'medium' as const,
      includeAnswerKey: lowerPrompt.includes('answer key') || lowerPrompt.includes('answers'),
      language: 'en',
    };
  };

  const generateWorksheetContent = async (params: {
    prompt: string;
    subject: string;
    grade: string;
    topic: string;
    questionCount: number;
    difficulty: string;
    includeAnswerKey: boolean;
    language: string;
  }): Promise<string> => {
    try {
      const systemPrompt = `You are an expert teacher creating educational worksheets. Create a comprehensive, well-structured worksheet that is appropriate for ${params.grade} students studying ${params.subject}.

The worksheet should include:
- Clear title and instructions
- ${params.questionCount} varied questions with different difficulty levels
- Mix of question types (multiple choice, short answer, problem solving)
- ${params.includeAnswerKey ? 'Answer key at the end' : 'No answer key'}
- Professional formatting suitable for printing

Topic focus: ${params.topic}
User request: ${params.prompt}

Format the output as a clean, printable worksheet in ${params.language === 'en' ? 'English' : 'the requested language'}.`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('http://vps.kyro.ninja:5000/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          prompt: systemPrompt,
          max_tokens: 2000,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.result || result.content || result.text || result.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }
      
      return content;
    } catch (error) {
      console.error('Content generation failed, using fallback:', error);
      return generateFallbackContent(params);
    }
  };

  const sendMessage = async (message: string) => {
    if (!canGenerateWorksheet) {
      setError(new Error('No credits remaining. Please upgrade your subscription.'));
      return;
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      parts: [{ type: 'text', text: message }]
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateWorksheetWithAI(message);
      
      const assistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        parts: [{ type: 'text', text: response }]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Message processing failed:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      
      // Add fallback response
      const fallbackMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: 'assistant',
        parts: [{ type: 'text', text: 'I encountered an issue generating your worksheet. Let me create a basic worksheet for you instead.' }]
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      // Generate fallback worksheet
      try {
        const params = parseWorksheetPrompt(message);
        const fallbackContent = generateFallbackContent(params);
        const pdfUrl = await createWorksheetPDF({
          title: `${params.subject} Worksheet - ${params.grade}`,
          content: fallbackContent,
          grade: params.grade,
          subject: params.subject,
        });
        
        const worksheet = {
          id: `worksheet-${Date.now()}`,
          title: `${params.subject} Worksheet - ${params.grade}`,
          content: fallbackContent,
          grade: params.grade,
          subject: params.subject,
          language: params.language,
          pdfUrl,
          createdAt: new Date().toISOString(),
          isFavorite: false,
          downloadCount: 0,
        };
        
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          (window as any).lastGeneratedWorksheet = {
            title: worksheet.title,
            id: worksheet.id,
            pdfUrl: worksheet.pdfUrl
          };
        }
        
        onSuccess?.(worksheet);
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };



  const generateFallbackContent = (params: {
    subject: string;
    grade: string;
    topic: string;
    questionCount: number;
    difficulty: string;
    includeAnswerKey: boolean;
    language: string;
  }): string => {
    const questions = generateSubjectQuestions(params.subject, params.grade, params.questionCount);
    
    return `${params.subject} Worksheet - ${params.grade}
Topic: ${params.topic}

Name: _________________________ Date: _____________

Instructions: Complete all questions below. Show your work where applicable.

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

${params.includeAnswerKey ? `${'='.repeat(50)}\nANSWER KEY\n${'='.repeat(50)}\n\n${questions.map((_, i) => `${i + 1}. [Answer for question ${i + 1}]`).join('\n')}\n\n` : ''}Generated by Bizzee Bee Worksheets - AI-Powered Worksheet Generator`;
  };

  const generateSubjectQuestions = (subject: string, grade: string, count: number): string[] => {
    const questionBank: Record<string, string[]> = {
      'Mathematics': [
        'Solve: 25 + 37 = ?',
        'What is 8 × 9?',
        'If Sarah has 15 apples and gives away 6, how many does she have left?',
        'Round 247 to the nearest ten.',
        'What is the area of a rectangle with length 8cm and width 5cm?',
        'Convert 3/4 to a decimal.',
        'What is 50% of 80?',
        'Solve for x: x + 12 = 20',
        'List the factors of 24.',
        'What is the perimeter of a square with sides of 7cm?',
        'Calculate: 144 ÷ 12',
        'What is 2/3 + 1/4?',
        'Find the missing number: 5, 10, 15, __, 25',
        'What is the volume of a cube with sides of 3cm?',
        'Convert 0.75 to a fraction.'
      ],
      'English': [
        'Write a sentence using the word "adventure".',
        'What is the past tense of "run"?',
        'Identify the noun in this sentence: "The cat sat on the mat."',
        'Write a synonym for "happy".',
        'What type of sentence is this: "Are you coming to the party?"',
        'Correct the spelling: "recieve"',
        'Write a short paragraph about your favorite season.',
        'What is the plural of "child"?',
        'Identify the verb in: "She quickly ran to school."',
        'Write an antonym for "hot".',
        'What is the main idea of this paragraph?',
        'Use "their", "there", and "they\'re" in three different sentences.',
        'What is a metaphor? Give an example.',
        'Identify the adjectives in: "The big, red balloon floated away."',
        'Write a haiku about nature.'
      ],
      'Natural Sciences': [
        'Name the three states of matter.',
        'What gas do plants need for photosynthesis?',
        'How many legs does an insect have?',
        'What is the largest planet in our solar system?',
        'Name one renewable energy source.',
        'What happens to water when it freezes?',
        'Which organ pumps blood through your body?',
        'What do we call animals that eat only plants?',
        'Name the force that pulls objects toward Earth.',
        'What is the chemical symbol for water?',
        'How many bones are in the human body?',
        'What is the process by which plants make food?',
        'Name the layers of the Earth.',
        'What causes the seasons?',
        'Explain the water cycle.'
      ],
      'Social Sciences': [
        'Name the seven continents.',
        'What is the capital city of South Africa?',
        'Who was the first president of democratic South Africa?',
        'What are the three branches of government?',
        'Name two natural resources found in South Africa.',
        'What is democracy?',
        'Name one of South Africa\'s official languages.',
        'What is the difference between a city and a town?',
        'Why do people migrate from one place to another?',
        'What is culture?',
        'Explain the concept of supply and demand.',
        'What are human rights?',
        'Name three types of landforms.',
        'What is the difference between weather and climate?',
        'Explain what a constitution is.'
      ]
    };

    const questions = questionBank[subject] || [
      'Define the main concept of this topic.',
      'Give three examples related to this subject.',
      'Explain why this topic is important.',
      'Compare and contrast two key ideas.',
      'What would happen if...?',
      'Describe the process of...',
      'List the main characteristics of...',
      'How does this relate to everyday life?',
      'What are the advantages and disadvantages?',
      'Summarize what you have learned.',
      'Analyze the relationship between...',
      'Predict what might happen if...',
      'Evaluate the importance of...',
      'Create a diagram showing...',
      'Justify your opinion about...'
    ];

    // Return the requested number of questions, cycling through if needed
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(questions[i % questions.length]);
    }
    return result;
  };

  const createWorksheetPDF = async (params: {
    title: string;
    content: string;
    grade: string;
    subject: string;
  }): Promise<string> => {
    try {
      // Create a simple text file for demo (since PDF generation is complex)
      const textContent = `${params.title}\n\n${params.content}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('PDF creation failed:', error);
      // Fallback to a working text file
      const textContent = `${params.title}\n\n${params.content}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      return URL.createObjectURL(blob);
    }
  };



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
      if (!worksheet?.pdfUrl) {
        Alert.alert('Error', 'No PDF available for download');
        return;
      }

      if (Platform.OS === 'web') {
        // For web, open the file in a new tab
        const link = document.createElement('a');
        link.href = worksheet.pdfUrl;
        link.download = `${worksheet.title || 'worksheet'}.txt`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Success', 'Worksheet downloaded successfully!');
        return;
      }

      // For mobile, download and share
      const downloadResult = await FileSystem.downloadAsync(
        worksheet.pdfUrl,
        FileSystem.documentDirectory + `${worksheet.title || 'worksheet'}.txt`
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        Alert.alert('Success', 'Worksheet downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download worksheet. Please try again.');
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isSuccess = message.parts.some((part: any) => 
      part.type === 'text' && part.text.includes('generated successfully')
    );
    const lastWorksheet = Platform.OS === 'web' && typeof window !== 'undefined' ? (window as any).lastGeneratedWorksheet : null;
    
    return (
      <View key={message.id} style={styles.messageContainer}>
        <View style={[
          styles.messageBubble,
          message.role === 'user' ? styles.userMessage : styles.assistantMessage
        ]}>
          {message.parts.map((part: any, partIndex: number) => {
            if (part.type === 'text') {
              return (
                <Text key={`text-${message.id}-${partIndex}`} style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
                ]}>
                  {part.text}
                </Text>
              );
            }
            return null;
          })}
          
          {/* Show download button for successful generations */}
          {message.role === 'assistant' && isSuccess && lastWorksheet && (
            <View style={styles.worksheetResult}>
              <View style={styles.worksheetHeader}>
                <FileText size={20} color={COLORS.success} />
                <Text style={styles.worksheetTitle}>Worksheet Ready!</Text>
              </View>
              <Button
                title="Download Worksheet"
                onPress={() => downloadWorksheet(lastWorksheet)}
                style={styles.downloadButton}
                size="small"
              />
            </View>
          )}
        </View>
      </View>
    );
  };

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

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>
              {error.message.includes('JSON') 
                ? 'Connection issue detected. Please try again or use the fallback worksheet generator.' 
                : `Error: ${error.message}`}
            </Text>
            <Button
              title="Try Fallback Generator"
              onPress={() => {
                // Generate a simple worksheet without AI
                const fallbackWorksheet = {
                  id: `worksheet-${Date.now()}`,
                  title: 'Sample Worksheet',
                  content: generateFallbackContent({
                    subject: 'Mathematics',
                    grade: 'Grade 5',
                    topic: 'Basic Math',
                    questionCount: 10,
                    difficulty: 'medium',
                    includeAnswerKey: true,
                    language: 'en',
                  }),
                  pdfUrl: '',
                };
                
                createWorksheetPDF({
                  title: fallbackWorksheet.title,
                  content: fallbackWorksheet.content,
                  grade: 'Grade 5',
                  subject: 'Mathematics',
                }).then(pdfUrl => {
                  fallbackWorksheet.pdfUrl = pdfUrl;
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    (window as any).lastGeneratedWorksheet = fallbackWorksheet;
                  }
                  onSuccess?.(fallbackWorksheet);
                });
              }}
              size="small"
              style={styles.fallbackButton}
            />
          </Card>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
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
          disabled={!input.trim()}
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
  fallbackButton: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.secondary,
  },
});