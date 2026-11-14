import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Menu, SlidersHorizontal, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { useNavigationStore } from '../../stores/navigationStore';

interface AppHeaderProps {
  title?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'UniDate',
  showFilter = false,
  onFilterPress,
  rightAction,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { openDrawer, unreadNotificationsCount } = useNavigationStore();

  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        {/* Menu button on Mobile & Tablet */}
        {!isDesktop && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Menu"
          >
            <Menu size={22} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Logo and Brand on mobile, or Page Title on desktop */}
        {!isDesktop ? (
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
            <Text style={styles.brandTitle}>{title}</Text>
          </View>
        ) : (
          <View style={styles.desktopTitleRow}>
            <Text style={styles.desktopTitle}>{title}</Text>
          </View>
        )}
      </View>

      {/* Right Actions */}
      <View style={styles.rightRow}>
        {showFilter && onFilterPress && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onFilterPress}
            activeOpacity={0.7}
            accessibilityLabel="Filter Options"
          >
            <SlidersHorizontal size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={colors.primary} />
            {unreadNotificationsCount > 0 && <View style={styles.notifBadgeDot} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.primary,
    fontWeight: '800',
  },
  desktopTitleRow: {
    paddingLeft: 4,
  },
  desktopTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    ...shadows.sm,
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});

