import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { FileText } from 'lucide-react-native';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WorksheetCard } from '@/components/worksheet/WorksheetCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: ['worksheets'],
    queryFn: () => apiService.getWorksheets(),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (worksheetId: string) => apiService.toggleFavorite(worksheetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
    },
  });

  const deleteWorksheetMutation = useMutation({
    mutationFn: (worksheetId: string) => apiService.deleteWorksheet(worksheetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleFavorite = (worksheet: Worksheet) => {
    toggleFavoriteMutation.mutate(worksheet.id);
  };

  const handleDelete = (worksheet: Worksheet) => {
    Alert.alert(
      'Delete Worksheet',
      `Are you sure you want to delete "${worksheet.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorksheetMutation.mutate(worksheet.id),
        },
      ]
    );
  };

  const renderWorksheet = ({ item }: { item: Worksheet }) => (
    <WorksheetCard
      worksheet={item}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
    />
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading worksheets..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load worksheets</Text>
        </View>
      </View>
    );
  }

  const worksheets = history?.worksheets || [];

  return (
    <View style={styles.container}>
      {worksheets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={64} color={COLORS.text.light} />
          <Text style={styles.emptyTitle}>No Worksheets Yet</Text>
          <Text style={styles.emptyDescription}>
            Start generating AI-powered worksheets to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={worksheets}
          renderItem={renderWorksheet}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    textAlign: 'center',
  },
});