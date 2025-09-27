import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const API_BASE_URL = 'http://vps.kyro.ninja:5000';

export function APITest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const testOpenAI = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      console.log('Testing OpenAI API...');
      console.log('API URL:', `${API_BASE_URL}/openai`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
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
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const content = data.choices?.[0]?.message?.content || data.content || 'No content received';
      setResult(`✅ Success!\n\nGenerated Content:\n${content}`);
      
    } catch (error) {
      console.error('Test failed:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - server took too long to respond';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          errorMessage = 'Network error - unable to connect to server. Check if the server is running and accessible.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setResult(`❌ Failed: ${errorMessage}\n\nTroubleshooting:\n- Check if server is running at ${API_BASE_URL}\n- Verify network connectivity\n- Check CORS settings if running on web`);
      Alert.alert('API Test Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setServerStatus(response.ok ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const testHealth = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      console.log('Testing health endpoint...');
      console.log('Health URL:', `${API_BASE_URL}/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('Health response status:', response.status);
      console.log('Health response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Health response:', data);
      setResult(`✅ Server is healthy!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      setServerStatus('online');
      
    } catch (error) {
      console.error('Health test failed:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - server not responding';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server - check if it\'s running';
        } else {
          errorMessage = error.message;
        }
      }
      
      setResult(`❌ Health check failed: ${errorMessage}\n\nServer URL: ${API_BASE_URL}\n\nPossible issues:\n- Server is not running\n- Wrong URL or port\n- Network connectivity problems\n- CORS issues (if on web)`);
      setServerStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>API Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.serverInfo}>Server: {API_BASE_URL}</Text>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot,
            {
              backgroundColor: 
                serverStatus === 'online' ? COLORS.success :
                serverStatus === 'offline' ? COLORS.error :
                COLORS.text.secondary
            }
          ]} />
          <Text style={styles.statusText}>
            {serverStatus === 'online' ? 'Online' :
             serverStatus === 'offline' ? 'Offline' :
             'Checking...'}
          </Text>
        </View>
      </View>
      
      {serverStatus === 'offline' && (
        <View style={styles.fallbackNotice}>
          <Text style={styles.fallbackText}>
            ⚠️ Server offline - Using fallback mode
          </Text>
          <Text style={styles.fallbackSubtext}>
            Worksheets will be generated locally without AI
          </Text>
        </View>
      )}
      
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
  statusContainer: {
    marginBottom: SPACING.md,
  },
  serverInfo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    fontFamily: 'monospace',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  fallbackNotice: {
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  fallbackText: {
    ...TYPOGRAPHY.body,
    color: COLORS.warning,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  fallbackSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
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
    fontSize: 12,
  },
});