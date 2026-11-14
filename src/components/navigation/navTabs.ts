import React from 'react';
import {
  Compass,
  Heart,
  Flame,
  MessageCircle,
  CalendarDays,
  Bell,
  UserRound,
  Settings,
} from 'lucide-react-native';

export interface NavTabItem {
  id: string;
  name: string;
  route: string;
  icon: (color: string, size?: number) => React.ReactNode;
  badgeKey?: 'likesCount' | 'matchesCount' | 'unreadMessagesCount' | 'unreadNotificationsCount';
}

export const NAV_TABS: NavTabItem[] = [
  {
    id: 'discover',
    name: 'Discover',
    route: '/(tabs)',
    icon: (color, size = 22) => React.createElement(Compass, { color, size }),
  },
  {
    id: 'likes',
    name: 'Likes',
    route: '/(tabs)/likes',
    icon: (color, size = 22) => React.createElement(Heart, { color, size }),
    badgeKey: 'likesCount',
  },
  {
    id: 'matches',
    name: 'Matches',
    route: '/(tabs)/matches',
    icon: (color, size = 22) => React.createElement(Flame, { color, size }),
    badgeKey: 'matchesCount',
  },
  {
    id: 'messages',
    name: 'Messages',
    route: '/(tabs)/messages',
    icon: (color, size = 22) => React.createElement(MessageCircle, { color, size }),
    badgeKey: 'unreadMessagesCount',
  },
  {
    id: 'events',
    name: 'Events',
    route: '/(tabs)/events',
    icon: (color, size = 22) => React.createElement(CalendarDays, { color, size }),
  },
  {
    id: 'notifications',
    name: 'Notifications',
    route: '/(tabs)/notifications',
    icon: (color, size = 22) => React.createElement(Bell, { color, size }),
    badgeKey: 'unreadNotificationsCount',
  },
  {
    id: 'profile',
    name: 'My Profile',
    route: '/(tabs)/profile',
    icon: (color, size = 22) => React.createElement(UserRound, { color, size }),
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/(tabs)/settings',
    icon: (color, size = 22) => React.createElement(Settings, { color, size }),
  },
];

