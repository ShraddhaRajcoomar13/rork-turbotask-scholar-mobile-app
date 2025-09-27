import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const API_BASE_URL = 'http://vps.kyro.ninja:5000';
const FALLBACK_API_URL = 'http://localhost:5000';

export function APITest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const testOpenAI = async () => {
    setIsLoading(true);
    setResult('');
    
    const urls = [API_BASE_URL, FALLBACK_API_URL];
    let lastError = '';
    
    for (const url of urls) {
      try {
        console.log(`Testing OpenAI API at: ${url}/openai`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for AI
        
        const response = await fetch(`${url}/openai`, {
          method: 'POST',
          mode: 'cors',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            prompt: 'Create a simple math worksheet for Grade 3 students with 5 addition problems.',
            max_tokens: 500,
            temperature: 0.7,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log(`OpenAI response status for ${url}:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.error(`OpenAI API Error for ${url}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const responseText = await response.text();
        let data: any = {};
        
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error('Invalid JSON response from OpenAI API');
        }
        
        console.log(`OpenAI API Response for ${url}:`, data);
        
        const content = data.result || data.content || data.text || data.choices?.[0]?.message?.content || 'No content received';
        
        if (!content || content === 'No content received') {
          throw new Error('OpenAI API returned empty content');
        }
        
        setResult(`✅ Success with ${url}!\n\nGenerated Content:\n${content}`);
        setIsLoading(false);
        return;
        
      } catch (error) {
        console.error(`OpenAI test failed for ${url}:`, error);
        let errorMessage = 'Unknown error';
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - AI generation took too long';
          } else if (error.message.includes('Failed to fetch') || 
                     error.message.includes('Network request failed') ||
                     error.message.includes('CORS') ||
                     error.message.includes('ERR_NETWORK')) {
            errorMessage = `Network error - unable to connect to ${url}`;
          } else {
            errorMessage = error.message;
          }
        }
        
        lastError = errorMessage;
        continue;
      }
    }
    
    // All servers failed
    setResult(`❌ All OpenAI tests failed\n\nLast error: ${lastError}\n\nTested URLs:\n- ${API_BASE_URL}/openai\n- ${FALLBACK_API_URL}/openai\n\nTroubleshooting:\n- Check if servers are running\n- Verify OpenAI API key configuration\n- Check network connectivity\n- Verify CORS settings`);
    console.error('OpenAI Test Failed:', lastError);
    setIsLoading(false);
  };

  const checkServerStatus = async () => {
    const urls = [API_BASE_URL, FALLBACK_API_URL];
    
    for (const url of urls) {
      try {
        console.log(`Checking server status at: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${url}/health`, {
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Server online at: ${url}`);
          setServerStatus('online');
          return;
        }
      } catch (error) {
        console.warn(`❌ Server check failed for ${url}:`, error);
        continue;
      }
    }
    
    console.warn('❌ All servers offline');
    setServerStatus('offline');
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const testHealth = async () => {
    setIsLoading(true);
    setResult('');
    
    const urls = [API_BASE_URL, FALLBACK_API_URL];
    let lastError = '';
    
    for (const url of urls) {
      try {
        console.log(`Testing health endpoint: ${url}/health`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${url}/health`, {
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        console.log(`Health response status for ${url}:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const responseText = await response.text();
        let data: any = {};
        
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText || 'Server responded successfully' };
        }
        
        console.log(`Health response for ${url}:`, data);
        setResult(`✅ Server is healthy at ${url}!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
        setServerStatus('online');
        setIsLoading(false);
        return;
        
      } catch (error) {
        console.error(`Health test failed for ${url}:`, error);
        let errorMessage = 'Unknown error';
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - server not responding';
          } else if (error.message.includes('Failed to fetch') || 
                     error.message.includes('Network request failed') ||
                     error.message.includes('CORS') ||
                     error.message.includes('ERR_NETWORK')) {
            errorMessage = `Cannot connect to server at ${url}`;
          } else {
            errorMessage = error.message;
          }
        }
        
        lastError = errorMessage;
        continue;
      }
    }
    
    // All servers failed
    setResult(`❌ All health checks failed\n\nLast error: ${lastError}\n\nTested URLs:\n- ${API_BASE_URL}\n- ${FALLBACK_API_URL}\n\nPossible issues:\n- Servers are not running\n- Network connectivity problems\n- CORS configuration issues\n- Firewall blocking requests`);
    setServerStatus('offline');
    setIsLoading(false);
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>API Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.serverInfo}>Primary: {API_BASE_URL}</Text>
        <Text style={styles.serverInfo}>Fallback: {FALLBACK_API_URL}</Text>
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
            {serverStatus === 'online' ? 'Server Available' :
             serverStatus === 'offline' ? 'All Servers Offline' :
             'Checking Servers...'}
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