/**
 * UniDate — Card Component
 * White surface on blush background with rounded corners
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii, shadows } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'flat' | 'elevated';
  padding?: 'default' | 'compact' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'default',
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'default' && styles.bordered,
        variant === 'elevated' && styles.elevated,
        padding === 'default' && styles.paddingDefault,
        padding === 'compact' && styles.paddingCompact,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    ...shadows.md,
  },
  paddingDefault: {
    padding: spacing.lg,
  },
  paddingCompact: {
    padding: spacing.md,
  },
});

