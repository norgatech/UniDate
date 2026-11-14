/**
 * UniDate — Input Component
 * Text, Password, Phone variants with label, error, and helper states
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radii, layout } from '../../theme/spacing';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'text' | 'password' | 'phone' | 'textarea';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  variant = 'text',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  disabled = false,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = variant === 'password';
  const isTextarea = variant === 'textarea';

  const borderColor = error
    ? colors.inputError
    : isFocused
    ? colors.inputFocus
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          { borderColor },
          isFocused && styles.focused,
          disabled && styles.disabledWrapper,
          isTextarea && styles.textareaWrapper,
          inputStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            isTextarea && styles.textarea,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon || isPassword ? styles.inputWithRightIcon : null,
            disabled && styles.disabledInput,
          ]}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          multiline={isTextarea}
          numberOfLines={isTextarea ? 4 : 1}
          textAlignVertical={isTextarea ? 'top' : 'center'}
          accessibilityLabel={label}
          {...textInputProps}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    minHeight: layout.inputMinHeight,
    paddingHorizontal: spacing.lg,
  },
  focused: {
    borderWidth: 1.5,
  },
  disabledWrapper: {
    backgroundColor: colors.inputDisabled,
  },
  textareaWrapper: {
    minHeight: 120,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  textarea: {
    paddingTop: spacing.md,
    minHeight: 100,
  },
  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: spacing.sm,
  },
  disabledInput: {
    color: colors.textSecondary,
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  error: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helper: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

