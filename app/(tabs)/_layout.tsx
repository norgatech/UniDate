import React from 'react';
import { Tabs, usePathname, router } from 'expo-router';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '../../src/theme/colors';
import { SideNavigation } from '../../src/components/navigation/SideNavigation';
import { MobileDrawer } from '../../src/components/navigation/MobileDrawer';
import { useNavigationStore } from '../../src/stores/navigationStore';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { isTabletCollapsed, toggleTabletCollapsed } = useNavigationStore();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.rootContainer}>
      {/* Fixed Vertical Sidebar for Desktop */}
      {isDesktop && (
        <SideNavigation
          activeRoute={pathname}
          onNavigate={handleNavigate}
        />
      )}

      {/* Collapsible/Expandable Sidebar for Tablet */}
      {isTablet && (
        <SideNavigation
          activeRoute={pathname}
          onNavigate={handleNavigate}
          collapsed={isTabletCollapsed}
          onToggleCollapse={toggleTabletCollapsed}
          isTablet
        />
      )}

      {/* Main Content Area */}
      <View style={styles.mainContentContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Side-tab navigation handles all platforms
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Discover',
            }}
          />
          <Tabs.Screen
            name="likes"
            options={{
              title: 'Likes',
            }}
          />
          <Tabs.Screen
            name="matches"
            options={{
              title: 'Matches',
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Messages',
            }}
          />
          <Tabs.Screen
            name="events"
            options={{
              title: 'Events',
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'My Profile',
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
          <Tabs.Screen
            name="chats"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>

      {/* Slide-out Side Navigation Drawer for Mobile (Android & iOS) */}
      {isMobile && (
        <MobileDrawer
          activeRoute={pathname}
          onNavigate={handleNavigate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  mainContentContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
