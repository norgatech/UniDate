/**
 * UniDate — Supabase Client Configuration
 *
 * IMPORTANT: Do NOT hardcode credentials.
 * Create a .env file with your Supabase project URL and anon key.
 * See .env.example for the required variables.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { supabaseAuthStorage } from './authStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not configured. ' +
    'Copy .env.example to .env and add your Supabase project URL and anon key. ' +
    'The app will run with mock data until credentials are provided.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

