/**
 * UniDate — Avatar Component
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 48,
  style,
  showOnlineIndicator = false,
  isOnline = false,
}) => {
  const indicatorSize = Math.max(12, size * 0.25);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <User size={size * 0.5} color={colors.textSecondary} />
        </View>
      )}
      {showOnlineIndicator && (
        <View
          style={[
            styles.indicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              backgroundColor: isOnline ? colors.success : colors.textSecondary,
              borderWidth: indicatorSize * 0.2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.pink,
  },
  placeholder: {
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.surface,
  },
});

