/**
 * UniDate — Button Component
 * Primary, Secondary, Destructive, and Text variants
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, layout } from '../../theme/spacing';
import { ArrowRight } from 'lucide-react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'text';
  size?: 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  showArrow?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  showArrow = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles: StyleProp<ViewStyle> = [
    styles.base,
    size === 'small' ? styles.small : styles.default,
    fullWidth && styles.fullWidth,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'destructive' && styles.destructive,
    variant === 'text' && styles.text,
    isDisabled && styles.disabled,
    isDisabled && variant === 'primary' && styles.primaryDisabled,
    style,
  ];

  const labelStyles: StyleProp<TextStyle> = [
    size === 'small' ? typography.buttonSmall : typography.button,
    variant === 'primary' && styles.primaryLabel,
    variant === 'secondary' && styles.secondaryLabel,
    variant === 'destructive' && styles.destructiveLabel,
    variant === 'text' && styles.textLabel,
    isDisabled && styles.disabledLabel,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={labelStyles}>{title}</Text>
          {showArrow && (
            <View style={styles.arrowWrapper}>
              <ArrowRight
                size={18}
                color={variant === 'primary' ? colors.white : colors.primary}
              />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  default: {
    minHeight: layout.buttonMinHeight,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  small: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryDisabled: {
    backgroundColor: colors.pink,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  destructive: {
    backgroundColor: colors.error,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.primary,
  },
  destructiveLabel: {
    color: colors.white,
  },
  textLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  arrowWrapper: {
    marginLeft: 8,
  },
});

