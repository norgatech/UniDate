import { create } from 'zustand';

interface NavigationState {
  isDrawerOpen: boolean;
  isTabletCollapsed: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  toggleTabletCollapsed: () => void;
  // Badge counts
  likesCount: number;
  matchesCount: number;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  setLikesCount: (count: number) => void;
  setMatchesCount: (count: number) => void;
  setUnreadMessagesCount: (count: number) => void;
  setUnreadNotificationsCount: (count: number) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isDrawerOpen: false,
  isTabletCollapsed: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  toggleTabletCollapsed: () => set((state) => ({ isTabletCollapsed: !state.isTabletCollapsed })),
  likesCount: 4,
  matchesCount: 4,
  unreadMessagesCount: 2,
  unreadNotificationsCount: 3,
  setLikesCount: (likesCount) => set({ likesCount }),
  setMatchesCount: (matchesCount) => set({ matchesCount }),
  setUnreadMessagesCount: (unreadMessagesCount) => set({ unreadMessagesCount }),
  setUnreadNotificationsCount: (unreadNotificationsCount) => set({ unreadNotificationsCount }),
}));

