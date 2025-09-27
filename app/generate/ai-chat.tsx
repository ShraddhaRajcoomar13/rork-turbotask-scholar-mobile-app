import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { AIWorksheetGenerator } from '@/components/worksheet/AIWorksheetGenerator';
import { COLORS } from '@/constants/theme';

export default function AIGenerateScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'AI Worksheet Assistant',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.surface,
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
});