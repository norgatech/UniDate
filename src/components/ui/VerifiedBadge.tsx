import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface VerifiedBadgeProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  withBorder?: boolean;
}

/**
 * VerifiedBadge — Authentic TikTok-style cyan-blue verified checkmark.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 16,
  style,
  withBorder = false,
}) => {
  const checkSize = Math.max(8, Math.round(size * 0.62));

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        withBorder && styles.badgeBorder,
        style,
      ]}
      accessibilityLabel="Verified Student"
    >
      <Check size={checkSize} color="#FFFFFF" strokeWidth={3.4} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.verifiedBlue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeBorder: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

