import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Heart, Trash2, FileText } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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

  const handleDownload = async (worksheet: Worksheet) => {
    try {
      const fileUri = FileSystem.documentDirectory + `${worksheet.title}.pdf`;
      const downloadResult = await FileSystem.downloadAsync(worksheet.pdfUrl, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        Alert.alert('Success', 'Worksheet downloaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download worksheet');
    }
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
    <Card style={styles.worksheetCard}>
      <View style={styles.worksheetHeader}>
        <View style={styles.worksheetInfo}>
          <Text style={styles.worksheetTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.worksheetMeta}>
            {item.grade} • {item.subject} • {item.language}
          </Text>
          <Text style={styles.worksheetDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <FileText size={24} color={COLORS.primary} />
      </View>

      <View style={styles.worksheetActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownload(item)}
          testID={`download-${item.id}`}
        >
          <Download size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleFavorite(item)}
          testID={`favorite-${item.id}`}
        >
          <Heart 
            size={20} 
            color={item.isFavorite ? COLORS.accent : COLORS.text.light}
            fill={item.isFavorite ? COLORS.accent : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
          testID={`delete-${item.id}`}
        >
          <Trash2 size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading worksheets..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load worksheets</Text>
        </View>
      </SafeAreaView>
    );
  }

  const worksheets = history?.worksheets || [];

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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
  worksheetCard: {
    marginBottom: SPACING.md,
  },
  worksheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  worksheetInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  worksheetTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  worksheetMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  worksheetDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.text.light,
  },
  worksheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.background,
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