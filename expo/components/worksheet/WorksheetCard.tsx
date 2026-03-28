import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Heart, Calendar, BookOpen, Globe } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { WorksheetDownloader } from './WorksheetDownloader';
import { Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface WorksheetCardProps {
  worksheet: Worksheet;
  onToggleFavorite?: (worksheet: Worksheet) => void;
  onDelete?: (worksheet: Worksheet) => void;
  showActions?: boolean;
}

export function WorksheetCard({ 
  worksheet, 
  onToggleFavorite,
  onDelete,
  showActions = true 
}: WorksheetCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'af': 'Afrikaans',
      'zu': 'isiZulu',
      'xh': 'isiXhosa',
      'st': 'Sesotho',
      'tn': 'Setswana',
      'ss': 'siSwati',
      've': 'Tshivenda',
      'ts': 'Xitsonga',
      'nr': 'isiNdebele',
      'nso': 'Sepedi',
    };
    return languages[code] || code;
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {worksheet.title}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <BookOpen size={14} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{worksheet.grade}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <BookOpen size={14} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{worksheet.subject}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Globe size={14} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{getLanguageName(worksheet.language)}</Text>
            </View>
          </View>
          
          <View style={styles.dateRow}>
            <Calendar size={14} color={COLORS.text.light} />
            <Text style={styles.dateText}>
              Created {formatDate(worksheet.createdAt)}
            </Text>
          </View>
        </View>

        {showActions && onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(worksheet)}
            testID={`favorite-${worksheet.id}`}
          >
            <Heart
              size={24}
              color={worksheet.isFavorite ? COLORS.accent : COLORS.text.light}
              fill={worksheet.isFavorite ? COLORS.accent : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>

      {worksheet.thumbnailUrl && (
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: worksheet.thumbnailUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.thumbnailOverlay}>
            <Text style={styles.pdfLabel}>PDF</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {worksheet.content && (
          <Text style={styles.description} numberOfLines={3}>
            {worksheet.content}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <WorksheetDownloader 
          worksheet={worksheet}
          onDownloadStart={() => console.log('Download started for:', worksheet.title)}
          onDownloadComplete={() => console.log('Download completed for:', worksheet.title)}
          onDownloadError={(error) => console.error('Download error for:', worksheet.title, error)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text.light,
  },
  favoriteButton: {
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.surface,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  pdfLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.surface,
    fontWeight: '600',
  },
  content: {
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
});