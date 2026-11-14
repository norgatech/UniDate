import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { X, ShieldCheck, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { NAV_TABS, NavTabItem } from './navTabs';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import { VerifiedBadge } from '../ui/VerifiedBadge';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 320);

interface MobileDrawerProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  activeRoute,
  onNavigate,
}) => {
  const { isDrawerOpen, closeDrawer } = useNavigationStore();
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);
  const navStore = useNavigationStore();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: !isWeb,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: !isWeb,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: !isWeb,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: !isWeb,
        }),
      ]).start();
    }
  }, [isDrawerOpen]);

  const handleSelectTab = (route: string) => {
    closeDrawer();
    onNavigate(route);
  };

  const handleLogout = () => {
    closeDrawer();
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

  const isTabActive = (itemRoute: string) => {
    if (itemRoute === '/(tabs)') {
      return activeRoute === '/' || activeRoute === '/(tabs)' || activeRoute === '/index' || activeRoute === '/(tabs)/index';
    }
    return activeRoute.includes(itemRoute.replace('/(tabs)/', ''));
  };

  const getBadgeCount = (key?: NavTabItem['badgeKey']): number => {
    if (!key) return 0;
    return navStore[key] || 0;
  };

  if (!isDrawerOpen) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Slide-out Drawer Panel */}
      <Animated.View
        style={[
          styles.drawerPanel,
          {
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Drawer Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
              <View>
                <Text style={styles.brandTitle}>UniDate</Text>
                <Text style={styles.brandSubtitle}>Campus Discovery</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeDrawer}
              activeOpacity={0.7}
            >
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Student Profile Card */}
          <TouchableOpacity
            style={styles.userSection}
            onPress={() => handleSelectTab('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: profile?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {profile?.display_name || 'Queen'}
                </Text>
                <VerifiedBadge size={15} style={{ marginLeft: 5 }} />
              </View>
              <Text style={styles.userAcademic} numberOfLines={1}>
                {profile?.faculty || 'ASSE'} • {profile?.level || '300'}L
              </Text>
              <Text style={styles.userUni} numberOfLines={1}>
                {profile?.university_name || 'University of Lagos'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Navigation Items (Touch-Friendly List) */}
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
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => handleSelectTab(tab.route)}
                  activeOpacity={0.75}
                >
                  <View style={styles.navIconBox}>
                    {tab.icon(active ? colors.white : colors.primary, 22)}
                  </View>

                  <Text
                    style={[styles.navLabel, active && styles.navLabelActive]}
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
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Drawer Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.safetyButton}
              onPress={() => {
                closeDrawer();
                router.push('/privacy-safety');
              }}
              activeOpacity={0.7}
            >
              <ShieldCheck size={18} color={colors.success} />
              <Text style={styles.safetyButtonText}>Privacy & Safety Center</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={18} color={colors.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>UniDate v1.0.0 • Verified Campus Edition</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 999,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
    zIndex: 1000,
    ...shadows.xl,
  },
  safeArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#FFF7F7',
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
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
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  userAcademic: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  userUni: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
  navList: {
    flex: 1,
  },
  navListContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.xl,
  },
  navItemActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  navIconBox: {
    marginRight: 14,
  },
  navLabel: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeActive: {
    backgroundColor: colors.white,
  },
  badgeInactive: {
    backgroundColor: colors.pink,
  },
  badgeText: {
    ...typography.captionSmall,
    fontSize: 12,
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
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  safetyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    backgroundColor: '#E8F5E9',
  },
  safetyButtonText: {
    ...typography.caption,
    color: '#2E7D32',
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    ...typography.body,
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  versionText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
