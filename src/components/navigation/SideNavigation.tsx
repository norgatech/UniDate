import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { NAV_TABS, NavTabItem } from './navTabs';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import { VerifiedBadge } from '../ui/VerifiedBadge';

interface SideNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isTablet?: boolean;
}

export const SideNavigation: React.FC<SideNavigationProps> = ({
  activeRoute,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  isTablet = false,
}) => {
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);
  const navStore = useNavigationStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of UniDate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const getBadgeCount = (key?: NavTabItem['badgeKey']): number => {
    if (!key) return 0;
    return navStore[key] || 0;
  };

  const isTabActive = (itemRoute: string) => {
    if (itemRoute === '/(tabs)') {
      return activeRoute === '/' || activeRoute === '/(tabs)' || activeRoute === '/index' || activeRoute === '/(tabs)/index';
    }
    return activeRoute.includes(itemRoute.replace('/(tabs)/', ''));
  };

  const sidebarWidth = collapsed ? 80 : isTablet ? 230 : 260;

  return (
    <View style={[styles.container, { width: sidebarWidth }]}>
      {/* Brand Header */}
      <View style={[styles.header, collapsed && styles.headerCollapsed]}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
          {!collapsed && (
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandTitle}>UniDate</Text>
              <Text style={styles.brandSubtitle}>Campus Discovery</Text>
            </View>
          )}
        </View>

        {/* Tablet collapse toggle button */}
        {isTablet && onToggleCollapse && (
          <TouchableOpacity
            style={styles.collapseBtn}
            onPress={onToggleCollapse}
            activeOpacity={0.7}
          >
            {collapsed ? (
              <ChevronRight size={18} color={colors.primary} />
            ) : (
              <ChevronLeft size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* User snippet when expanded */}
      {!collapsed && (
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => onNavigate('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: profile?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.userAvatar}
            contentFit="cover"
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile?.display_name || 'Queen'}
              </Text>
              <VerifiedBadge size={15} style={{ marginLeft: 5 }} />
            </View>
            <Text style={styles.userSub} numberOfLines={1}>
              {profile?.faculty || 'ASSE'} • {profile?.level || '300'}L
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Navigation List */}
      <ScrollView
        style={styles.navList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navListContent}
      >
        {NAV_TABS.map((tab) => {
          const active = isTabActive(tab.route);
          const badgeCount = getBadgeCount(tab.badgeKey);

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.navItem,
                collapsed && styles.navItemCollapsed,
                active && styles.navItemActive,
              ]}
              onPress={() => onNavigate(tab.route)}
              activeOpacity={0.75}
            >
              <View style={styles.iconWrapper}>
                {tab.icon(active ? colors.white : colors.textSecondary, 22)}
                {collapsed && badgeCount > 0 && (
                  <View style={styles.miniBadgeDot} />
                )}
              </View>

              {!collapsed && (
                <>
                  <Text
                    style={[
                      styles.navLabel,
                      active && styles.navLabelActive,
                    ]}
                  >
                    {tab.name}
                  </Text>

                  {badgeCount > 0 && (
                    <View
                      style={[
                        styles.badge,
                        active ? styles.badgeActive : styles.badgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          active ? styles.badgeTextActive : styles.badgeTextInactive,
                        ]}
                      >
                        {badgeCount}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer controls */}
      <View style={[styles.footer, collapsed && styles.footerCollapsed]}>
        {!collapsed && (
          <TouchableOpacity
            style={styles.safetyLink}
            onPress={() => router.push('/privacy-safety')}
            activeOpacity={0.7}
          >
            <ShieldCheck size={18} color={colors.success} />
            <Text style={styles.safetyLinkText}>Safety & ID Vault</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.logoutBtn, collapsed && styles.logoutBtnCollapsed]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={colors.error} />
          {!collapsed && <Text style={styles.logoutText}>Log Out</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    display: 'flex',
    flexDirection: 'column',
    ...shadows.sm,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCollapsed: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 20,
    lineHeight: 24,
    color: colors.primary,
    fontWeight: '800',
  },
  brandSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: -2,
  },
  collapseBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    padding: 10,
    borderRadius: radii.xl,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    ...typography.label,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  userSub: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontSize: 12,
  },
  navList: {
    flex: 1,
  },
  navListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radii.xl,
    minHeight: 46,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  iconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  miniBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  navLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    marginLeft: 6,
  },
  badgeActive: {
    backgroundColor: colors.white,
  },
  badgeInactive: {
    backgroundColor: colors.pink,
  },
  badgeText: {
    ...typography.captionSmall,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: colors.primary,
  },
  badgeTextInactive: {
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  footerCollapsed: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  safetyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    backgroundColor: '#E8F5E9',
  },
  safetyLinkText: {
    ...typography.captionSmall,
    color: '#2E7D32',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
  },
  logoutBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  logoutText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
});

