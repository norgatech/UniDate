/**
 * UniDate — Web-Compatible Auth Storage Adapter for Supabase
 * 
 * This adapter works around the issue where AsyncStorage tries to access
 * `window.localStorage` during static rendering (SSR) in Node.js environment.
 */
import { Platform } from 'react-native';

// No-op storage for SSR/static rendering
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

// Web storage using localStorage (only available in browser)
const webStorage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

// Native storage using AsyncStorage
let nativeStorage: typeof webStorage | null = null;
if (Platform.OS !== 'web') {
  // Dynamic import to avoid bundling AsyncStorage on web
  const AsyncStorage = await import('@react-native-async-storage/async-storage');
  nativeStorage = AsyncStorage.default;
}

export const supabaseAuthStorage = Platform.OS === 'web' ? webStorage : (nativeStorage ?? noopStorage);