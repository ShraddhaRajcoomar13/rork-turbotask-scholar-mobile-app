import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AIWorksheetGenerator } from '@/components/worksheet/AIWorksheetGenerator';
import { COLORS, SPACING } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function AIGenerateScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'AI Worksheet Assistant',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.surface,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.surface} />
            </TouchableOpacity>
          ),
        }} 
      />
      <AIWorksheetGenerator 
        onSuccess={(worksheet) => {
          console.log('Worksheet generated successfully:', worksheet.title);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
});