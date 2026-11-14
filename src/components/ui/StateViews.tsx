/**
 * UniDate — Loading, Empty, Error State Components
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from './Button';
import { SearchX, WifiOff, AlertCircle, Heart, MessageCircle, CalendarDays } from 'lucide-react-native';

// ============ Loading State ============
interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

// ============ Skeleton Loader ============
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
}) => (
  <View
    style={[
      styles.skeleton,
      { width: width as any, height, borderRadius },
    ]}
  />
);

// ============ Empty State ============
interface EmptyStateProps {
  icon?: 'search' | 'heart' | 'message' | 'calendar';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const emptyIcons = {
  search: SearchX,
  heart: Heart,
  message: MessageCircle,
  calendar: CalendarDays,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const Icon = emptyIcons[icon];

  return (
    <View style={styles.center}>
      <View style={styles.emptyIconWrapper}>
        <Icon size={48} color={colors.pink} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction && (
        <View style={styles.emptyAction}>
          <Button title={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
        </View>
      )}
    </View>
  );
};

// ============ Error State ============
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isOffline?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  isOffline = false,
}) => {
  const Icon = isOffline ? WifiOff : AlertCircle;
  const defaultTitle = isOffline ? 'No Connection' : 'Something went wrong';
  const defaultMessage = isOffline
    ? 'Please check your internet connection and try again.'
    : 'We had trouble loading this content. Please try again.';

  return (
    <View style={styles.center}>
      <View style={styles.errorIconWrapper}>
        <Icon size={48} color={colors.error} />
      </View>
      <Text style={styles.errorTitle}>{title || defaultTitle}</Text>
      <Text style={styles.errorMessage}>{message || defaultMessage}</Text>
      {onRetry && (
        <View style={styles.emptyAction}>
          <Button title="Try Again" onPress={onRetry} variant="secondary" fullWidth={false} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['4xl'],
  },
  message: {
    ...typography.supporting,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  skeleton: {
    backgroundColor: colors.skeletonBase,
    marginBottom: spacing.sm,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.supporting,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: spacing.xl,
  },
  errorIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.supporting,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

