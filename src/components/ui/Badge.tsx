/**
 * UniDate — Badge Component
 * Verification, status indicators
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radii } from '../../theme/spacing';
import { ShieldCheck, Clock, AlertTriangle, XCircle } from 'lucide-react-native';
import type { VerificationStatus } from '../../types';
import { VerifiedBadge } from './VerifiedBadge';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'default' | 'small';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'default',
  style,
}) => {
  const variantStyles = badgeVariants[variant];

  return (
    <View style={[styles.base, size === 'small' && styles.small, variantStyles.container, style]}>
      <Text style={[size === 'small' ? typography.captionSmall : typography.caption, variantStyles.label]}>
        {label}
      </Text>
    </View>
  );
};

// Verification-specific badge
interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'default' | 'small';
  style?: ViewStyle;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'default',
  style,
}) => {
  const config = verificationConfig[status];
  const iconSize = size === 'small' ? 12 : 14;

  return (
    <View style={[styles.verificationBase, config.containerStyle, size === 'small' && styles.small, style]}>
      {status === 'verified' ? (
        <VerifiedBadge size={iconSize + 2} />
      ) : (
        <config.Icon size={iconSize} color={config.iconColor} />
      )}
      <Text style={[size === 'small' ? typography.captionSmall : typography.caption, config.labelStyle, { marginLeft: 4 }]}>
        {config.label}
      </Text>
    </View>
  );
};

const badgeVariants = {
  success: {
    container: { backgroundColor: '#E8F5E9' } as ViewStyle,
    label: { color: colors.success },
  },
  warning: {
    container: { backgroundColor: '#FFF3E0' } as ViewStyle,
    label: { color: colors.warning },
  },
  error: {
    container: { backgroundColor: '#FFEBEE' } as ViewStyle,
    label: { color: colors.error },
  },
  info: {
    container: { backgroundColor: colors.pink } as ViewStyle,
    label: { color: colors.primary },
  },
  neutral: {
    container: { backgroundColor: '#F5F5F5' } as ViewStyle,
    label: { color: colors.textSecondary },
  },
};

const verificationConfig: Record<VerificationStatus, {
  label: string;
  Icon: typeof ShieldCheck;
  iconColor: string;
  containerStyle: ViewStyle;
  labelStyle: { color: string };
}> = {
  verified: {
    label: 'Verified',
    Icon: ShieldCheck,
    iconColor: colors.verifiedBlue,
    containerStyle: { backgroundColor: '#E0F9FD' },
    labelStyle: { color: colors.verifiedText },
  },
  pending: {
    label: 'Pending',
    Icon: Clock,
    iconColor: colors.warning,
    containerStyle: { backgroundColor: '#FFF3E0' },
    labelStyle: { color: colors.warning },
  },
  rejected: {
    label: 'Rejected',
    Icon: XCircle,
    iconColor: colors.error,
    containerStyle: { backgroundColor: '#FFEBEE' },
    labelStyle: { color: colors.error },
  },
  resubmission_required: {
    label: 'Resubmit',
    Icon: AlertTriangle,
    iconColor: colors.warning,
    containerStyle: { backgroundColor: '#FFF3E0' },
    labelStyle: { color: colors.warning },
  },
  not_submitted: {
    label: 'Not Verified',
    Icon: AlertTriangle,
    iconColor: colors.textSecondary,
    containerStyle: { backgroundColor: '#F5F5F5' },
    labelStyle: { color: colors.textSecondary },
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  verificationBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
});

