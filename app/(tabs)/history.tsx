import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { 
  FileText, 
  Download, 
  Heart, 
  Trash2, 
  Search,
  Calendar,
  BookOpen,
  GraduationCap
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WorksheetDownloader } from '@/components/worksheet/WorksheetDownloader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { router } from 'expo-router';

// Mock data for development
const MOCK_WORKSHEETS: Worksheet[] = [
  {
    id: '1',
    title: 'Mathematics Addition Worksheet',
    content: 'Addition problems for Grade 3 students with step-by-step solutions',
    grade: 'Grade 3',
    subject: 'Mathematics',
    language: 'en',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-20T10:30:00Z',
    isFavorite: true,
    downloadCount: 5,
  },
  {
    id: '2',
    title: 'English Reading Comprehension',
    content: 'Reading comprehension exercises with short stories and questions',
    grade: 'Grade 5',
    subject: 'English',
    language: 'en',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-19T14:15:00Z',
    isFavorite: false,
    downloadCount: 3,
  },
  {
    id: '3',
    title: 'Natural Sciences - Plant Life Cycles',
    content: 'Plant biology worksheet covering life cycles and photosynthesis',
    grade: 'Grade 4',
    subject: 'Natural Sciences',
    language: 'en',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-18T09:45:00Z',
    isFavorite: false,
    downloadCount: 8,
  },
];

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const queryClient = useQueryClient();

  // In development, use mock data
  const worksheetsQuery = useQuery({
    queryKey: ['worksheets'],
    queryFn: async () => {
      if (__DEV__) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          worksheets: MOCK_WORKSHEETS,
          totalGenerated: MOCK_WORKSHEETS.length,
          creditsUsed: MOCK_WORKSHEETS.length,
        };
      }
      return apiService.getWorksheets();
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (worksheetId: string) => {
      if (__DEV__) {
        // Mock toggle favorite
        return Promise.resolve({ isFavorite: true });
      }
      return apiService.toggleFavorite(worksheetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
    },
  });

  const deleteWorksheetMutation = useMutation({
    mutationFn: (worksheetId: string) => {
      if (__DEV__) {
        return Promise.resolve();
      }
      return apiService.deleteWorksheet(worksheetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] });
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['worksheets'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleToggleFavorite = (worksheetId: string) => {
    toggleFavoriteMutation.mutate(worksheetId);
  };

  const handleDeleteWorksheet = (worksheetId: string, title: string) => {
    Alert.alert(
      'Delete Worksheet',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteWorksheetMutation.mutate(worksheetId)
        }
      ]
    );
  };

  const handleGenerateNew = () => {
    router.push('/generate/worksheet');
  };

  const filteredWorksheets = React.useMemo(() => {
    if (!worksheetsQuery.data?.worksheets) return [];
    
    let filtered = worksheetsQuery.data.worksheets;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(worksheet => 
        worksheet.title.toLowerCase().includes(query) ||
        worksheet.subject.toLowerCase().includes(query) ||
        worksheet.grade.toLowerCase().includes(query)
      );
    }
    
    // Apply favorites filter
    if (selectedFilter === 'favorites') {
      filtered = filtered.filter(worksheet => worksheet.isFavorite);
    }
    
    return filtered;
  }, [worksheetsQuery.data?.worksheets, searchQuery, selectedFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (worksheetsQuery.isLoading) {
    return <LoadingSpinner message="Loading your worksheets..." />;
  }

  if (worksheetsQuery.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to Load Worksheets</Text>
        <Text style={styles.errorMessage}>
          {worksheetsQuery.error instanceof Error ? worksheetsQuery.error.message : 'Unknown error'}
        </Text>
        <Button
          title="Try Again"
          onPress={() => worksheetsQuery.refetch()}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const worksheets = filteredWorksheets;
  const isEmpty = worksheets.length === 0;

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{worksheetsQuery.data?.totalGenerated || 0}</Text>
            <Text style={styles.statLabel}>Total Generated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{worksheetsQuery.data?.creditsUsed || 0}</Text>
            <Text style={styles.statLabel}>Credits Used</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {worksheetsQuery.data?.worksheets.filter(w => w.isFavorite).length || 0}
            </Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </Card>

      {/* Search and Filters */}
      <Card style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search worksheets..."
            style={styles.searchInput}
          />
        </View>
        
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'favorites' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('favorites')}
          >
            <Heart 
              size={16} 
              color={selectedFilter === 'favorites' ? COLORS.surface : COLORS.text.secondary}
              fill={selectedFilter === 'favorites' ? COLORS.surface : 'none'}
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'favorites' && styles.filterButtonTextActive
            ]}>
              Favorites
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Worksheets List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isEmpty ? (
          <Card style={styles.emptyCard}>
            <FileText size={48} color={COLORS.text.light} />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No worksheets found' : 'No worksheets yet'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery.trim() 
                ? 'Try adjusting your search terms or filters'
                : 'Generate your first AI-powered worksheet to get started'
              }
            </Text>
            {!searchQuery.trim() && (
              <Button
                title="Generate Worksheet"
                onPress={handleGenerateNew}
                style={styles.generateButton}
              />
            )}
          </Card>
        ) : (
          worksheets.map((worksheet) => (
            <Card key={worksheet.id} style={styles.worksheetCard}>
              <View style={styles.worksheetHeader}>
                <View style={styles.worksheetInfo}>
                  <Text style={styles.worksheetTitle}>{worksheet.title}</Text>
                  <View style={styles.worksheetMeta}>
                    <View style={styles.metaItem}>
                      <GraduationCap size={14} color={COLORS.text.secondary} />
                      <Text style={styles.metaText}>{worksheet.grade}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <BookOpen size={14} color={COLORS.text.secondary} />
                      <Text style={styles.metaText}>{worksheet.subject}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={COLORS.text.secondary} />
                      <Text style={styles.metaText}>{formatDate(worksheet.createdAt)}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.worksheetActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleFavorite(worksheet.id)}
                  >
                    <Heart
                      size={20}
                      color={worksheet.isFavorite ? COLORS.accent : COLORS.text.secondary}
                      fill={worksheet.isFavorite ? COLORS.accent : 'none'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteWorksheet(worksheet.id, worksheet.title)}
                  >
                    <Trash2 size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.worksheetContent} numberOfLines={2}>
                {worksheet.content}
              </Text>
              
              <View style={styles.worksheetFooter}>
                <WorksheetDownloader worksheet={worksheet} />
                
                {worksheet.downloadCount !== undefined && (
                  <View style={styles.downloadStats}>
                    <Download size={14} color={COLORS.text.secondary} />
                    <Text style={styles.downloadCount}>
                      {worksheet.downloadCount} downloads
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  searchCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchIcon: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  generateButton: {
    marginTop: SPACING.md,
  },
  worksheetCard: {
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.sm,
  },
  worksheetMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  worksheetActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  worksheetContent: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  worksheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  downloadCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
  },
});