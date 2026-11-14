/**
 * UniDate — App Store (Zustand)
 * Manages app-level state: matches, conversations, events
 */
import { create } from 'zustand';
import type {
  Match,
  Conversation,
  CampusEvent,
  DiscoveryPreferences,
  StudentProfile,
  Notification,
  BlockedUser,
} from '../types';

interface AppState {
  // Discovery
  discoveryProfiles: StudentProfile[];
  discoveryPreferences: DiscoveryPreferences;
  currentProfileIndex: number;

  // Likes & Matches
  receivedLikes: StudentProfile[];
  matches: Match[];
  showMatchCelebration: boolean;
  matchedProfile: StudentProfile | null;

  // Messaging
  conversations: Conversation[];
  unreadCount: number;

  // Events
  events: CampusEvent[];

  // Notifications
  notifications: Notification[];
  unreadNotifications: number;

  // Blocked users
  blockedUsers: BlockedUser[];

  // Actions
  setDiscoveryProfiles: (profiles: StudentProfile[]) => void;
  setDiscoveryPreferences: (prefs: DiscoveryPreferences) => void;
  nextProfile: () => void;
  setReceivedLikes: (likes: StudentProfile[]) => void;
  setMatches: (matches: Match[]) => void;
  showMatch: (profile: StudentProfile) => void;
  hideMatchCelebration: () => void;
  setConversations: (conversations: Conversation[]) => void;
  setUnreadCount: (count: number) => void;
  setEvents: (events: CampusEvent[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setBlockedUsers: (users: BlockedUser[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  discoveryProfiles: [],
  discoveryPreferences: {
    age_range: [18, 30],
    interests: [],
    verified_only: false,
  },
  currentProfileIndex: 0,

  receivedLikes: [],
  matches: [],
  showMatchCelebration: false,
  matchedProfile: null,

  conversations: [],
  unreadCount: 0,

  events: [],

  notifications: [],
  unreadNotifications: 0,

  blockedUsers: [],

  setDiscoveryProfiles: (discoveryProfiles) => set({ discoveryProfiles, currentProfileIndex: 0 }),
  setDiscoveryPreferences: (discoveryPreferences) => set({ discoveryPreferences }),
  nextProfile: () => set((state) => ({ currentProfileIndex: state.currentProfileIndex + 1 })),
  setReceivedLikes: (receivedLikes) => set({ receivedLikes }),
  setMatches: (matches) => set({ matches }),
  showMatch: (matchedProfile) => set({ showMatchCelebration: true, matchedProfile }),
  hideMatchCelebration: () => set({ showMatchCelebration: false, matchedProfile: null }),
  setConversations: (conversations) => set({ conversations }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setEvents: (events) => set({ events }),
  setNotifications: (notifications) => set({ notifications }),
  setBlockedUsers: (blockedUsers) => set({ blockedUsers }),
}));

