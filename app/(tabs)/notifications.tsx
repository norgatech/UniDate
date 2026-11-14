import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Heart,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCheck,
  Clock,
  ChevronRight,
  Bell,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { radii, shadows } from '../../src/theme/spacing';
import { AppHeader } from '../../src/components/navigation/AppHeader';
import { EmptyState } from '../../src/components/ui/StateViews';
import { useNavigationStore } from '../../src/stores/navigationStore';

interface NotificationItem {
  id: string;
  type: 'match' | 'like' | 'event' | 'verification';
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  avatarUrl?: string;
  actionRoute?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'match',
    title: 'New Mutual Match! 🎉',
    message: 'You and Sarah both liked each other. Say hello now!',
    timeAgo: '15m ago',
    isRead: false,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200',
    actionRoute: '/chat/conv-1',
  },
  {
    id: 'n2',
    type: 'like',
    title: 'New Profile Like ❤️',
    message: 'A student from Faculty of Science liked your profile.',
    timeAgo: '2h ago',
    isRead: false,
    actionRoute: '/(tabs)/likes',
  },
  {
    id: 'n3',
    type: 'event',
    title: 'Campus Mixer Reminder 📅',
    message: 'Campus Speed Dating Mixer is happening Friday at 6:00 PM.',
    timeAgo: '1d ago',
    isRead: false,
    actionRoute: '/event/ev-1',
  },
  {
    id: 'n4',
    type: 'verification',
    title: 'Student ID Verified 🛡️',
    message: 'Your student credentials have been confirmed by campus moderation.',
    timeAgo: '2d ago',
    isRead: true,
    actionRoute: '/(tabs)/profile',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const setUnreadNotificationsCount = useNavigationStore((s) => s.setUnreadNotificationsCount);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadNotificationsCount(0);
  };

  const handleNotificationPress = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    const remainingUnread = notifications.filter((n) => n.id !== item.id && !n.isRead).length;
    setUnreadNotificationsCount(remainingUnread);

    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'match':
        return <Sparkles size={20} color={colors.accent} />;
      case 'like':
        return <Heart size={20} color={colors.accent} fill={colors.accent} />;
      case 'event':
        return <Calendar size={20} color={colors.primary} />;
      case 'verification':
        return <ShieldCheck size={20} color={colors.success} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Notifications" />

      <View style={styles.container}>
        {/* Controls Row */}
        <View style={styles.controlsRow}>
          <View style={styles.pills}>
            <TouchableOpacity
              style={[styles.pill, filter === 'all' && styles.pillActive]}
              onPress={() => setFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filter === 'all' && styles.pillTextActive]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, filter === 'unread' && styles.pillActive]}
              onPress={() => setFilter('unread')}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filter === 'unread' && styles.pillTextActive]}>
                Unread
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.markAllReadBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <CheckCheck size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="message"
              title="All caught up!"
              message="You have no unread notifications right now. Check back when you receive matches or likes."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.75}
            >
              <View style={styles.iconContainer}>
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.iconCircle}>
                    {renderIcon(item.type)}
                  </View>
                )}
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                </View>

                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>

              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  notificationCardUnread: {
    backgroundColor: '#FFF7F7',
    borderColor: colors.pink,
    borderWidth: 1.5,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...typography.label,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  timeAgo: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontSize: 11,
    marginLeft: 6,
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
