import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const API_BASE_URL = 'http://vps.kyro.ninja:5000';

export function APITest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testOpenAI = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      console.log('Testing OpenAI API...');
      
      const response = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: 'Create a simple math worksheet for Grade 3 students with 5 addition problems.'
          }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const content = data.choices?.[0]?.message?.content || data.content || 'No content received';
      setResult(content);
      
    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`Error: ${errorMessage}`);
      Alert.alert('API Test Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealth = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      console.log('Testing health endpoint...');
      
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log('Health response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Health response:', data);
      setResult(`Health check: ${JSON.stringify(data, null, 2)}`);
      
    } catch (error) {
      console.error('Health test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`Health Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>API Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Test Health"
          onPress={testHealth}
          loading={isLoading}
          style={styles.button}
        />
        <Button
          title="Test OpenAI"
          onPress={testOpenAI}
          loading={isLoading}
          style={styles.button}
        />
      </View>
      
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  button: {
    flex: 1,
  },
  resultContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  resultTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  resultText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontFamily: 'monospace',
  },
});