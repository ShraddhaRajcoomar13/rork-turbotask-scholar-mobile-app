import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface WorksheetSuccessNotificationProps {
  visible: boolean;
  worksheetTitle: string;
  onDownload?: () => void;
  onViewHistory?: () => void;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function WorksheetSuccessNotification({
  visible,
  worksheetTitle,
  onDownload,
  onViewHistory,
  onClose,
  autoHide = true,
  duration = 5000,
}: WorksheetSuccessNotificationProps) {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const hideNotification = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  }, [slideAnim, opacityAnim, onClose]);

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (autoHide) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible, autoHide, duration, hideNotification, slideAnim, opacityAnim]);



  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <CheckCircle size={24} color={COLORS.success} />
          <Text style={styles.title}>Worksheet Created!</Text>
        </View>
        
        <Text style={styles.subtitle} numberOfLines={2}>
          &quot;{worksheetTitle}&quot; is ready for download
        </Text>

        <View style={styles.actions}>
          {onDownload && (
            <Button
              title="Download"
              onPress={onDownload}
              variant="primary"
              size="small"
              style={styles.actionButton}
              testID="notification-download"
            />
          )}
          
          {onViewHistory && (
            <Button
              title="View All"
              onPress={onViewHistory}
              variant="outline"
              size="small"
              style={styles.actionButton}
              testID="notification-history"
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
});