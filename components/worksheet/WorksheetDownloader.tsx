import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { FileText } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiService } from '@/services/api';
import { Worksheet } from '@/types/worksheet';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface WorksheetDownloaderProps {
  worksheet: Worksheet;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}

export function WorksheetDownloader({ 
  worksheet, 
  onDownloadStart,
  onDownloadComplete,
  onDownloadError 
}: WorksheetDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9\-_\s]/g, '_').replace(/\s+/g, '_');
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      onDownloadStart?.();

      if (Platform.OS === 'web') {
        // Web: Open PDF in new tab
        await WebBrowser.openBrowserAsync(worksheet.pdfUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });
        onDownloadComplete?.();
      } else {
        // Mobile: Download and save to device
        const downloadUrl = await apiService.downloadWorksheet(worksheet.id);
        const filename = `${sanitizeFilename(worksheet.title)}_${worksheet.grade}_${worksheet.subject}.pdf`;
        const fileUri = FileSystem.documentDirectory + filename;

        console.log('Downloading worksheet:', { downloadUrl, fileUri });

        const downloadResumable = FileSystem.createDownloadResumable(
          downloadUrl,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            setDownloadProgress(Math.round(progress * 100));
          }
        );

        const downloadResult = await downloadResumable.downloadAsync();
        
        if (downloadResult?.uri) {
          console.log('Download completed:', downloadResult.uri);
          
          // Check if sharing is available
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: `Share ${worksheet.title}`,
              UTI: 'com.adobe.pdf',
            });
          } else {
            Alert.alert(
              'Download Complete',
              `Worksheet saved successfully!\n\nFile: ${filename}`,
              [{ text: 'OK' }]
            );
          }
          
          onDownloadComplete?.();
        } else {
          throw new Error('Download failed - no file URI returned');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download worksheet';
      onDownloadError?.(errorMessage);
      Alert.alert('Download Failed', errorMessage);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = await apiService.shareWorksheet(worksheet.id);
      
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Success', 'Share link copied to clipboard!');
        } else {
          // Fallback for older browsers
          Alert.alert('Share Link', shareUrl);
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(shareUrl, {
            dialogTitle: `Share ${worksheet.title}`,
          });
        } else {
          Alert.alert('Share Link', shareUrl);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Unable to create share link');
    }
  };

  const handlePreview = async () => {
    try {
      await WebBrowser.openBrowserAsync(worksheet.pdfUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: COLORS.primary,
        toolbarColor: COLORS.surface,
      });
    } catch (error) {
      console.error('Preview error:', error);
      Alert.alert('Preview Failed', 'Unable to open worksheet preview');
    }
  };

  if (isDownloading) {
    return (
      <View style={styles.downloadingContainer}>
        <LoadingSpinner size="small" />
        <Text style={styles.downloadingText}>
          Downloading... {downloadProgress > 0 && `${downloadProgress}%`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button
          title="Download"
          onPress={handleDownload}
          variant="primary"
          size="small"
          style={styles.actionButton}
          testID={`download-${worksheet.id}`}
        />
        
        <Button
          title="Preview"
          onPress={handlePreview}
          variant="outline"
          size="small"
          style={styles.actionButton}
          testID={`preview-${worksheet.id}`}
        />
        
        <Button
          title="Share"
          onPress={handleShare}
          variant="outline"
          size="small"
          style={styles.actionButton}
          testID={`share-${worksheet.id}`}
        />
      </View>
      
      <View style={styles.infoRow}>
        <FileText size={16} color={COLORS.text.secondary} />
        <Text style={styles.infoText}>
          PDF • {worksheet.grade} • {worksheet.subject}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  downloadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
});